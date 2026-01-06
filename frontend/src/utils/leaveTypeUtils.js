/**
 * Get shortcut/abbreviation for leave type names
 * @param {string} leaveTypeName - Full leave type name
 * @returns {string} - Shortcut/abbreviation for the leave type
 */
export const getLeaveTypeShortcut = (leaveTypeName) => {
    if (!leaveTypeName) return 'N/A';
    
    const leaveType = leaveTypeName.trim().toLowerCase();
    
    // Common leave type mappings
    const shortcuts = {
      'sick leave': 'SL',
      'casual leave': 'CL',
      'earned leave': 'EL',
      'annual leave': 'AL',
      'personal leave': 'PL',
      'maternity leave': 'ML',
      'paternity leave': 'PL',
      'bereavement leave': 'BL',
      'compensatory leave': 'Comp Off',
      'compensatory': 'Comp Off',
      'comp off': 'Comp Off',
      'compensatory off': 'Comp Off',
      'privilege leave': 'PL',
      'loss of pay': 'LOP',
      'leave without pay': 'LWP',
      'unpaid leave': 'UL',
      'emergency leave': 'EL',
      'half day leave': 'HDL',
      'short leave': 'SL',
      'work from home': 'WFH',
      'optional leave': 'OL',
      'holiday leave': 'HL',
      'vacation leave': 'VL',
      'study leave': 'SL',
      'sabbatical leave': 'SL',
    };
    
    // Check for exact match
    if (shortcuts[leaveType]) {
      return shortcuts[leaveType];
    }
    
    // Check for partial matches (contains)
    for (const [key, value] of Object.entries(shortcuts)) {
      if (leaveType.includes(key) || key.includes(leaveType)) {
        return value;
      }
    }
    
    // If no match found, generate abbreviation from first letters of words
    const words = leaveTypeName.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first 2-3 letters
      return leaveTypeName.substring(0, 3).toUpperCase();
    } else {
      // Multiple words - take first letter of each word (max 3 words)
      return words.slice(0, 3).map(word => word[0].toUpperCase()).join('');
    }
  };
  
  