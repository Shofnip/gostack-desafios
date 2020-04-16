import { getRepository } from 'typeorm';
import parse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  importedFilename: string;
}

interface TransactionCSV {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ importedFilename }: Request): Promise<Transaction[]> {
    const importFilePath = path.join(uploadConfig.directory, importedFilename);

    const csvTransactions: TransactionCSV[] = [];

    const stream = fs
      .createReadStream(importFilePath)
      .pipe(parse({ columns: true }));

    stream.on('data', dataRow => {
      csvTransactions.push(dataRow);
    });

    await new Promise(resolve => {
      stream.on('end', resolve);
    });

    const categoryRepository = getRepository(Category);

    const categories = csvTransactions
      .map(transaction => transaction.category)
      .filter((elem, pos, self) => {
        return self.indexOf(elem) === pos;
      })
      .map(category => categoryRepository.create({ title: category }));

    await categoryRepository
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values(categories)
      .execute();

    const transactionRepository = getRepository(Transaction);

    const transactions = csvTransactions.map(transaction => {
      const { title, value, type } = transaction;
      const category = categories.filter(
        cat => cat.title === transaction.title,
      )[0];

      return transactionRepository.create({
        title,
        value,
        type,
        category,
      });
    });

    await transactionRepository
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values(transactions)
      .execute();

    await fs.promises.unlink(importFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
