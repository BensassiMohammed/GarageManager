import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'madCurrency',
  standalone: true
})
export class MadCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00 DH';
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return '0.00 DH';
    }
    
    const formatted = numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `${formatted} DH`;
  }
}
