import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface TransactionCSV {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const parsers = csvParse({ from_line: 2 });

    const stream = fs.createReadStream(filePath).pipe(parsers);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    stream.on('data', async dataRow => {
      const [
        title,
        type,
        value,
        category,
      ] = dataRow.map((transaction: string) => transaction.trim());

      if (!title || !value || !type) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => stream.on('end', resolve));

    await fs.promises.unlink(filePath);

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoriesTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoriesTitles.map((category: string) => ({ title: category })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(({ title, type, value, category }) => ({
        title,
        type,
        value,
        category: finalCategories.find(
          ({ title: categoryTitle }) => categoryTitle === category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
