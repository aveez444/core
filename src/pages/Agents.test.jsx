// COMPREHENSIVE TEST SUITE FOR AGENTS PAGE SLOT SYSTEM
// This test suite verifies both the slot display logic and language configuration system

// To run these tests, first install the required dependencies:
// npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

// Then run: npm test

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Agents from './Agents.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Mock the API calls
vi.mock('../services/api.js', () => ({
  fetchUserAgents: vi.fn(() => Promise.resolve([])),
  deleteAgent: vi.fn(() => Promise.resolve()),
  updateAgent: vi.fn(() => Promise.resolve()),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon">+</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash: () => <div data-testid="trash-icon">Trash</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  Volume2: () => <div data-testid="volume-icon">Volume</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Crown: () => <div data-testid="crown-icon">Crown</div>,
}));

// Helper function to create AuthContext value
const createAuthContextValue = (planType, agentCount = 0) => ({
  user: { 
    subscription_plan_type: planType,
    id: '123',
    name: 'Test User',
    email: 'test@example.com'
  },
  getAgentLimit: () => {
    switch (planType) {
      case 'basic': return 2;
      case 'pro': return 4;
      case 'enterprise': return 10;
      default: return 2;
    }
  },
  loading: false,
  error: null,
});

// Helper function to render component with AuthContext
const renderWithAuth = (planType, agents = []) => {
  const authValue = createAuthContextValue(planType, agents.length);
  
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <Agents />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Agents Slot System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Plan Slot Display', () => {
    it('should display 4 total slots for basic plan (2 available + 2 locked)', async () => {
      renderWithAuth('basic');
      
      // Wait for component to load
      await screen.findByText(/My Agents/i);
      
      // Should show 4 slots total
      const slots = screen.getAllByTestId(/agent-slot-|locked-slot-/);
      expect(slots).toHaveLength(4);
      
      // First 2 should be available (empty) slots
      const emptySlots = screen.getAllByTestId(/agent-slot-/);
      expect(emptySlots).toHaveLength(2);
      
      // Last 2 should be locked slots
      const lockedSlots = screen.getAllByTestId(/locked-slot-/);
      expect(lockedSlots).toHaveLength(2);
      
      // Locked slots should show Pro upgrade message
      expect(screen.getByText(/Upgrade to Pro/i)).toBeInTheDocument();
    });

    it('should show 1 agent + 1 empty + 2 locked slots when user has 1 agent', async () => {
      // Mock API to return 1 agent
      const mockAgent = {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        language: 'en',
        voice_id: 'default'
      };
      
      const { fetchUserAgents } = await import('../services/api.js');
      fetchUserAgents.mockResolvedValueOnce([mockAgent]);
      
      renderWithAuth('basic');
      
      // Wait for component to load
      await screen.findByText(/My Agents/i);
      
      // Should show the agent card
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      
      // Should show 4 slots total (1 filled + 1 empty + 2 locked)
      const slots = screen.getAllByTestId(/agent-slot-|locked-slot-/);
      expect(slots).toHaveLength(3); // 1 empty + 2 locked (agent card counted separately)
    });
  });

  describe('Pro Plan Slot Display', () => {
    it('should display 10 total slots for pro plan (4 available + 6 locked)', async () => {
      renderWithAuth('pro');
      
      await screen.findByText(/My Agents/i);
      
      // Should show 10 slots total
      const slots = screen.getAllByTestId(/agent-slot-|locked-slot-/);
      expect(slots).toHaveLength(10);
      
      // First 4 should be available (empty) slots
      const emptySlots = screen.getAllByTestId(/agent-slot-/);
      expect(emptySlots).toHaveLength(4);
      
      // Last 6 should be locked slots
      const lockedSlots = screen.getAllByTestId(/locked-slot-/);
      expect(lockedSlots).toHaveLength(6);
      
      // Locked slots should show Enterprise upgrade message
      expect(screen.getByText(/Upgrade to Enterprise/i)).toBeInTheDocument();
    });
  });

  describe('Enterprise Plan Slot Display', () => {
    it('should display 10 total unlocked slots for enterprise plan', async () => {
      renderWithAuth('enterprise');
      
      await screen.findByText(/My Agents/i);
      
      // Should show 10 available slots
      const emptySlots = screen.getAllByTestId(/agent-slot-/);
      expect(emptySlots).toHaveLength(10);
      
      // Should not show any locked slots
      const lockedSlots = screen.queryAllByTestId(/locked-slot-/);
      expect(lockedSlots).toHaveLength(0);
      
      // Should not show upgrade message
      expect(screen.queryByText(/Upgrade to/i)).not.toBeInTheDocument();
    });
  });
});

describe('Language Configuration System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Language Options by Plan', () => {
    it('should allow only English for basic plan users', async () => {
      renderWithAuth('basic');
      
      // Wait for component to load
      await screen.findByText(/My Agents/i);
      
      // Click on an empty slot to open create modal
      const emptySlot = screen.getAllByTestId(/agent-slot-/)[0];
      fireEvent.click(emptySlot);
      
      // Check language dropdown options
      const languageSelect = await screen.findByDisplayValue(/English/i);
      expect(languageSelect).toBeInTheDocument();
      
      // Hindi and Spanish should be disabled/locked
      const crownIcons = screen.getAllByTestId('crown-icon');
      expect(crownIcons.length).toBeGreaterThan(0); // Some languages should be locked
    });

    it('should allow English and Hindi for pro plan users', async () => {
      renderWithAuth('pro');
      
      await screen.findByText(/My Agents/i);
      
      // Click on an empty slot to open create modal
      const emptySlot = screen.getAllByTestId(/agent-slot-/)[0];
      fireEvent.click(emptySlot);
      
      // English and Hindi should be available
      // Spanish should be locked (crown icon)
      const crownIcons = screen.getAllByTestId('crown-icon');
      expect(crownIcons.length).toBeGreaterThan(0); // Spanish should be locked
    });

    it('should allow all languages for enterprise plan users', async () => {
      renderWithAuth('enterprise');
      
      await screen.findByText(/My Agents/i);
      
      // Click on an empty slot to open create modal
      const emptySlot = screen.getAllByTestId(/agent-slot-/)[0];
      fireEvent.click(emptySlot);
      
      // No languages should be locked (no crown icons)
      const crownIcons = screen.queryAllByTestId('crown-icon');
      expect(crownIcons).toHaveLength(0); // All languages should be unlocked
    });
  });

  describe('Language Display with Flags', () => {
    it('should display language flags in agent cards', async () => {
      // Mock API to return agent with different language
      const mockAgent = {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        language: 'hi',
        voice_id: 'default'
      };
      
      const { fetchUserAgents } = await import('../services/api.js');
      fetchUserAgents.mockResolvedValueOnce([mockAgent]);
      
      renderWithAuth('enterprise');
      
      await screen.findByText(/My Agents/i);
      await screen.findByText('Test Agent');
      
      // Should display Hindi language name and flag
      expect(screen.getByText('Hindi')).toBeInTheDocument();
      // The flag emoji should be rendered as text content
    });
  });
});

describe('Integration Tests', () => {
  it('should properly integrate slot limits with language restrictions', async () => {
    renderWithAuth('basic');
    
    await screen.findByText(/My Agents/i);
    
    // Should show 2 available slots and 2 locked slots
    const emptySlots = screen.getAllByTestId(/agent-slot-/);
    const lockedSlots = screen.getAllByTestId(/locked-slot-/);
    expect(emptySlots).toHaveLength(2);
    expect(lockedSlots).toHaveLength(2);
    
    // Click on available slot to create agent
    fireEvent.click(emptySlots[0]);
    
    // Language dropdown should only show English as available
    const languageSelect = await screen.findByDisplayValue(/English/i);
    expect(languageSelect).toBeInTheDocument();
    
    // Premium languages should show crown icons
    const crownIcons = screen.getAllByTestId('crown-icon');
    expect(crownIcons.length).toBeGreaterThan(0);
  });

  it('should show appropriate upgrade messaging in locked slots', async () => {
    renderWithAuth('pro');
    
    await screen.findByText(/My Agents/i);
    
    // Should show Enterprise upgrade message in locked slots
    expect(screen.getByText(/Upgrade to Enterprise/i)).toBeInTheDocument();
    expect(screen.getByText(/unlock all agent slots/i)).toBeInTheDocument();
  });
});
