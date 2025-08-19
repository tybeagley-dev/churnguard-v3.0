import { type User, type InsertUser, type Analytics, type InsertAnalytics, type Transaction, type InsertTransaction, type Product, type InsertProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAnalytics(): Promise<Analytics | undefined>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analytics: Analytics | undefined;
  private transactions: Map<string, Transaction>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.products = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize analytics data
    this.analytics = {
      id: randomUUID(),
      date: "2024-01-15",
      totalRevenue: "124532.00",
      activeUsers: 8426,
      conversionRate: "3.24",
      avgOrderValue: "89.50",
      revenueData: [
        { date: "Jan 1", revenue: 12000 },
        { date: "Jan 8", revenue: 19000 },
        { date: "Jan 15", revenue: 15000 },
        { date: "Jan 22", revenue: 25000 },
        { date: "Jan 29", revenue: 22000 },
        { date: "Feb 5", revenue: 28000 },
        { date: "Feb 12", revenue: 32000 }
      ],
      categoryData: [
        { name: "Software", value: 35, color: "#2563eb" },
        { name: "Services", value: 30, color: "#059669" },
        { name: "Hardware", value: 20, color: "#d97706" },
        { name: "Support", value: 15, color: "#dc2626" }
      ],
      performanceData: [
        { day: "Monday", sales: 45, traffic: 123 },
        { day: "Tuesday", sales: 52, traffic: 145 },
        { day: "Wednesday", sales: 38, traffic: 121 },
        { day: "Thursday", sales: 67, traffic: 187 },
        { day: "Friday", sales: 73, traffic: 201 },
        { day: "Saturday", sales: 29, traffic: 89 },
        { day: "Sunday", sales: 42, traffic: 156 }
      ],
      createdAt: new Date()
    };

    // Initialize products
    const productsData = [
      { name: "Premium Package", sales: 1247, revenue: "45230.00", rank: 1 },
      { name: "Basic Plan", sales: 2156, revenue: "32340.00", rank: 2 },
      { name: "Enterprise Suite", sales: 534, revenue: "28900.00", rank: 3 },
      { name: "Starter Pack", sales: 1892, revenue: "18920.00", rank: 4 }
    ];

    productsData.forEach(productData => {
      const id = randomUUID();
      const product: Product = { ...productData, id };
      this.products.set(id, product);
    });

    // Initialize transactions
    const transactionsData = [
      { date: "2024-01-15", customer: "Acme Corp", product: "Premium Package", amount: "1250.00", status: "Completed", customerInitials: "AC" },
      { date: "2024-01-14", customer: "Tech Innovations", product: "Basic Plan", amount: "299.00", status: "Pending", customerInitials: "TI" },
      { date: "2024-01-13", customer: "Global Solutions", product: "Enterprise Suite", amount: "5450.00", status: "Completed", customerInitials: "GS" },
      { date: "2024-01-12", customer: "Digital Systems", product: "Starter Pack", amount: "99.00", status: "Failed", customerInitials: "DS" },
      { date: "2024-01-11", customer: "Future Tech", product: "Premium Package", amount: "1250.00", status: "Completed", customerInitials: "FT" },
      { date: "2024-01-10", customer: "Smart Solutions", product: "Basic Plan", amount: "299.00", status: "Completed", customerInitials: "SS" },
      { date: "2024-01-09", customer: "Innovation Labs", product: "Enterprise Suite", amount: "5450.00", status: "Pending", customerInitials: "IL" },
      { date: "2024-01-08", customer: "NextGen Corp", product: "Starter Pack", amount: "99.00", status: "Completed", customerInitials: "NC" }
    ];

    transactionsData.forEach(transactionData => {
      const id = randomUUID();
      const transaction: Transaction = { ...transactionData, id };
      this.transactions.set(id, transaction);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAnalytics(): Promise<Analytics | undefined> {
    return this.analytics;
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = { ...insertAnalytics, id, createdAt: new Date() };
    this.analytics = analytics;
    return analytics;
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => a.rank - b.rank);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
}

export const storage = new MemStorage();
