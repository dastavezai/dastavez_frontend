export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '₹0';
  }
  
  
  return `₹${amount.toFixed(2)}`;
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') {
    return '0';
  }
  
  return number.toLocaleString('en-IN');
}; 