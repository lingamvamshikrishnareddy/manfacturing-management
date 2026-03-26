export const validators = {
    required(value: any): boolean {
      return value !== undefined && value !== null && value !== '';
    },
  
    email(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    phoneNumber(phone: string): boolean {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      return phoneRegex.test(phone);
    },
  
    dateRange(startDate: Date, endDate: Date): boolean {
      return startDate < endDate;
    },
  
    timeRange(startTime: string, endTime: string): boolean {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      return start < end;
    }
  };
  