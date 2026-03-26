export const helpers = {
    generateId(): string {
      return Math.random().toString(36).substr(2, 9);
    },
  
    sortByDate<T>(array: T[], dateField: keyof T): T[] {
      return [...array].sort((a, b) => {
        const dateA = new Date(a[dateField] as string);
        const dateB = new Date(b[dateField] as string);
        return dateB.getTime() - dateA.getTime();
      });
    },
  
    groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
      return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      }, {} as Record<string, T[]>);
    },
  
    calculateDateDifference(date1: Date, date2: Date): number {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  };