import React from 'react';

// Test component to verify agent slot generation logic
const AgentSlotTest = () => {
  const testCases = [
    { plan: 'basic', agentLimit: 2, agentCount: 0, expectedTotal: 4, expectedLocked: 2 },
    { plan: 'basic', agentLimit: 2, agentCount: 1, expectedTotal: 4, expectedLocked: 2 },
    { plan: 'basic', agentLimit: 2, agentCount: 2, expectedTotal: 4, expectedLocked: 2 },
    { plan: 'pro', agentLimit: 4, agentCount: 0, expectedTotal: 10, expectedLocked: 6 },
    { plan: 'pro', agentLimit: 4, agentCount: 2, expectedTotal: 10, expectedLocked: 6 },
    { plan: 'pro', agentLimit: 4, agentCount: 4, expectedTotal: 10, expectedLocked: 6 },
    { plan: 'enterprise', agentLimit: 10, agentCount: 5, expectedTotal: 10, expectedLocked: 0 },
    { plan: 'enterprise', agentLimit: 10, agentCount: 10, expectedTotal: 10, expectedLocked: 0 },
  ];

  const generateAgentSlots = (planType, agentLimit, agentCount) => {
    const slots = [];
    const allowedSlots = agentLimit;
    
    // Determine how many slots to show based on plan
    let totalSlotsToShow;
    let nextTier;
    
    if (planType === 'basic') {
      totalSlotsToShow = 4;
      nextTier = 'Pro';
    } else if (planType === 'pro') {
      totalSlotsToShow = 10;
      nextTier = 'Enterprise';
    } else {
      totalSlotsToShow = 10;
      nextTier = null;
    }
    
    // Fill with existing agents
    for (let i = 0; i < agentCount; i++) {
      slots.push({
        type: 'agent',
        index: i
      });
    }
    
    // Fill remaining allowed slots with empty slots
    const emptySlots = Math.max(0, allowedSlots - agentCount);
    for (let i = 0; i < emptySlots; i++) {
      slots.push({
        type: 'empty',
        index: agentCount + i
      });
    }
    
    // Fill remaining slots with locked slots
    const lockedSlots = totalSlotsToShow - allowedSlots;
    for (let i = 0; i < lockedSlots; i++) {
      slots.push({
        type: 'locked',
        index: allowedSlots + i,
        nextTier: nextTier
      });
    }
    
    return slots;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Agent Slot Logic Test</h2>
      
      <div className="space-y-4">
        {testCases.map((testCase, index) => {
          const slots = generateAgentSlots(testCase.plan, testCase.agentLimit, testCase.agentCount);
          const agentSlots = slots.filter(slot => slot.type === 'agent');
          const emptySlots = slots.filter(slot => slot.type === 'empty');
          const lockedSlots = slots.filter(slot => slot.type === 'locked');
          
          const isCorrect = slots.length === testCase.expectedTotal && 
                           lockedSlots.length === testCase.expectedLocked;
          
          return (
            <div key={index} className={`p-4 border rounded-lg ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Test Case {index + 1}</h3>
                  <p>Plan: {testCase.plan}</p>
                  <p>Agent Limit: {testCase.agentLimit}</p>
                  <p>Current Agents: {testCase.agentCount}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Results:</h4>
                  <p>Total Slots: {slots.length} (expected: {testCase.expectedTotal})</p>
                  <p>Agent Slots: {agentSlots.length}</p>
                  <p>Empty Slots: {emptySlots.length}</p>
                  <p>Locked Slots: {lockedSlots.length} (expected: {testCase.expectedLocked})</p>
                  <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✅ PASS' : '❌ FAIL'}
                  </p>
                </div>
              </div>
              
              {/* Visual representation */}
              <div className="mt-3 flex flex-wrap gap-1">
                {slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
                      slot.type === 'agent' 
                        ? 'bg-blue-500 text-white' 
                        : slot.type === 'empty' 
                        ? 'bg-gray-300 text-gray-600 border-2 border-dashed border-gray-400' 
                        : 'bg-yellow-400 text-yellow-800'
                    }`}
                    title={`${slot.type} slot ${slot.index + 1}`}
                  >
                    {slot.type === 'agent' ? '🤖' : slot.type === 'empty' ? '+' : '🔒'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentSlotTest;
