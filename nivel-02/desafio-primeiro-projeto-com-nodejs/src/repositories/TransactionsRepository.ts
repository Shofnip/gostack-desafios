import Transaction from '../models/Transaction';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionList {
  transactions: Array<CreateTransactionDTO>;
  balance: Balance;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): TransactionList {
    const balance = this.getBalance();
    return { transactions: this.transactions, balance };
  }

  public getBalance(): Balance {
    const { transactions } = this;
    const initialBalance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const balance = transactions.reduce((accumulator, transaction) => {
      switch (transaction.type) {
        case 'income':
          return {
            income: accumulator.income + transaction.value,
            outcome: accumulator.outcome,
            total: accumulator.total + transaction.value,
          };
        case 'outcome':
          return {
            income: accumulator.income,
            outcome: accumulator.outcome + transaction.value,
            total: accumulator.total - transaction.value,
          };
        default:
          return accumulator;
      }
    }, initialBalance);

    return balance;
  }

  public create({ title, type, value }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, type, value });

    const balance = this.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw Error('Not enough balance for this outcome.');
    }

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
