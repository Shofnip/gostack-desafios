import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionList {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<TransactionList> {
    const transactions = await this.find({ relations: ['category'] });

    const initialBalance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const balance = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        return {
          income: acc.income + transaction.value,
          outcome: acc.outcome,
          total: acc.total + transaction.value,
        };
      }
      return {
        income: acc.income,
        outcome: acc.outcome + transaction.value,
        total: acc.total - transaction.value,
      };
    }, initialBalance);

    return { transactions, balance };
  }
}

export default TransactionsRepository;
