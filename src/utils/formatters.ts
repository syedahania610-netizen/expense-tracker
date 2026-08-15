import { Transaction, FilterState, CategoryId } from '../types';

export const formatCurrency = (amount: number, currency = '$'): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${currency}${formatted}`;
};

export const formatDate = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;

    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getMonthProgress = (): { dayOfMonth: number; totalDays: number; percent: number; daysRemaining: number } => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const totalDays = getDaysInMonth(now.getFullYear(), now.getMonth());
  const percent = Math.round((dayOfMonth / totalDays) * 100);
  const daysRemaining = Math.max(1, totalDays - dayOfMonth);
  return { dayOfMonth, totalDays, percent, daysRemaining };
};

export const filterTransactions = (transactions: Transaction[], filters: FilterState): Transaction[] => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return transactions.filter((tx) => {
    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      const matchTags = tx.tags ? tx.tags.some(t => t.toLowerCase().includes(q)) : false;
      const matchCategory = tx.category.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);

      if (!matchTitle && !matchNotes && !matchTags && !matchCategory && !matchAmount) {
        return false;
      }
    }

    // 2. Type
    if (filters.type !== 'all' && tx.type !== filters.type) {
      return false;
    }

    // 3. Category
    if (filters.category !== 'all' && tx.category !== filters.category) {
      return false;
    }

    // 4. Payment Method
    if (filters.paymentMethod !== 'all' && tx.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    // 5. Date Range
    if (filters.dateRange === 'today') {
      if (tx.date !== todayStr) return false;
    } else if (filters.dateRange === 'this_week') {
      const txDate = new Date(tx.date);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (txDate < oneWeekAgo) return false;
    } else if (filters.dateRange === 'this_month') {
      const [y, m] = tx.date.split('-').map(Number);
      if (y !== now.getFullYear() || m !== now.getMonth() + 1) return false;
    } else if (filters.dateRange === 'last_month') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const [y, m] = tx.date.split('-').map(Number);
      if (y !== prevMonthDate.getFullYear() || m !== prevMonthDate.getMonth() + 1) return false;
    } else if (filters.dateRange === 'this_year') {
      const [y] = tx.date.split('-').map(Number);
      if (y !== now.getFullYear()) return false;
    } else if (filters.dateRange === 'custom') {
      if (filters.customStartDate && tx.date < filters.customStartDate) return false;
      if (filters.customEndDate && tx.date > filters.customEndDate) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'date_desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
    }
    if (filters.sortBy === 'date_asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
    }
    if (filters.sortBy === 'amount_desc') {
      return b.amount - a.amount;
    }
    if (filters.sortBy === 'amount_asc') {
      return a.amount - b.amount;
    }
    return 0;
  });
};

export const exportToCSV = (transactions: Transaction[]): void => {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Tags', 'Notes'];
  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.type}"`,
    `"${t.category}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    `"${t.paymentMethod}"`,
    `"${(t.tags || []).join(';')}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: { transactions: Transaction[]; budgets?: any[]; subscriptions?: any[] }): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `expenses_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVImport = (csvText: string): Partial<Transaction>[] => {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const results: Partial<Transaction>[] = [];
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser handling quotes
    const values: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"') {
        if (inQuotes && line[charIdx + 1] === '"') {
          currentVal += '"';
          charIdx++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length >= 5) {
      const date = values[1]?.replace(/^"|"$/g, '') || new Date().toISOString().split('T')[0];
      const type = (values[2]?.replace(/^"|"$/g, '').toLowerCase() === 'income' ? 'income' : 'expense') as 'income' | 'expense';
      const category = (values[3]?.replace(/^"|"$/g, '').toLowerCase() || 'other') as CategoryId;
      const title = values[4]?.replace(/^"|"$/g, '') || 'Imported item';
      const amount = parseFloat(values[5]?.replace(/^"|"$/g, '')) || 0;
      const paymentMethod = (values[6]?.replace(/^"|"$/g, '').toLowerCase() || 'card') as any;
      const rawTags = values[7]?.replace(/^"|"$/g, '') || '';
      const tags = rawTags ? rawTags.split(';').map(t => t.trim()).filter(Boolean) : [];
      const notes = values[8]?.replace(/^"|"$/g, '') || '';

      results.push({
        id: `tx-imp-${Date.now()}-${i}`,
        title,
        amount: Math.abs(amount),
        type,
        category,
        date,
        paymentMethod: ['card', 'cash', 'bank_transfer', 'apple_pay', 'crypto'].includes(paymentMethod) ? paymentMethod : 'card',
        tags,
        notes,
        createdAt: Date.now(),
      });
    }
  }

  return results;
};
