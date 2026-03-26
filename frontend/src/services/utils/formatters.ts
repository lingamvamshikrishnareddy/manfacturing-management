export const formatters = {
    date(date: string | Date): string {
      return new Date(date).toLocaleDateString();
    },
  
    time(time: string): string {
      return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  
    currency(amount: number): string {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
  
    percentage(value: number): string {
      return `${value.toFixed(1)}%`;
    },
  
    capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };
  