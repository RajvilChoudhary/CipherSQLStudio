// backend/utils/seedData.js
// Run this script ONCE to populate MongoDB with sample assignments
// Command: node utils/seedData.js
//
// This simulates what an "admin" would pre-populate in the real app

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');

const sampleAssignments = [
  {
    title: "Select All Employees",
    description: "Practice the most basic SQL query - selecting all records from a table.",
    difficulty: "Easy",
    question: "Write a SQL query to retrieve ALL columns and ALL rows from the 'employees' table.",
    hints: [
      "The SELECT statement is used to fetch data from a table.",
      "The asterisk (*) is a wildcard that means 'all columns'.",
    ],
    tags: ["SELECT", "Basic"],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" },
          { columnName: "hire_date", dataType: "DATE" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 95000, hire_date: "2021-03-15" },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 72000, hire_date: "2020-07-01" },
          { id: 3, name: "Carol White", department: "Engineering", salary: 88000, hire_date: "2022-01-10" },
          { id: 4, name: "David Lee", department: "HR", salary: 65000, hire_date: "2019-11-20" },
          { id: 5, name: "Emma Davis", department: "Marketing", salary: 78000, hire_date: "2021-08-05" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "Alice Johnson", department: "Engineering", salary: 95000 },
        { id: 2, name: "Bob Smith", department: "Marketing", salary: 72000 },
        { id: 3, name: "Carol White", department: "Engineering", salary: 88000 },
        { id: 4, name: "David Lee", department: "HR", salary: 65000 },
        { id: 5, name: "Emma Davis", department: "Marketing", salary: 78000 }
      ]
    }
  },
  {
    title: "Filter by Department",
    description: "Use WHERE clause to filter employees by department.",
    difficulty: "Easy",
    question: "Retrieve the names and salaries of all employees who work in the 'Engineering' department.",
    hints: ["The WHERE clause filters rows based on a condition."],
    tags: ["SELECT", "WHERE", "Filter"],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 95000 },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 72000 },
          { id: 3, name: "Carol White", department: "Engineering", salary: 88000 },
          { id: 4, name: "David Lee", department: "HR", salary: 65000 },
          { id: 5, name: "Emma Davis", department: "Marketing", salary: 78000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alice Johnson", salary: 95000 },
        { name: "Carol White", salary: 88000 }
      ]
    }
  },
  {
    title: "Average Salary by Department",
    description: "Learn to use GROUP BY and aggregate functions like AVG().",
    difficulty: "Medium",
    question: "Calculate the average salary for each department. Show department name and average salary, ordered by average salary descending.",
    hints: ["You'll need to group rows by department.", "AVG() is an aggregate function."],
    tags: ["GROUP BY", "AVG", "ORDER BY", "Aggregates"],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 95000 },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 72000 },
          { id: 3, name: "Carol White", department: "Engineering", salary: 88000 },
          { id: 4, name: "David Lee", department: "HR", salary: 65000 },
          { id: 5, name: "Emma Davis", department: "Marketing", salary: 78000 },
          { id: 6, name: "Frank Brown", department: "HR", salary: 70000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { department: "Engineering", avg_salary: 91500 },
        { department: "Marketing", avg_salary: 75000 },
        { department: "HR", avg_salary: 67500 }
      ]
    }
  },
  {
    title: "Join Orders with Customers",
    description: "Practice INNER JOIN to combine data from two related tables.",
    difficulty: "Medium",
    question: "Write a query to display each customer's name alongside their order total. Only show customers who have placed at least one order.",
    hints: ["JOIN combines rows from two tables based on a related column.", "INNER JOIN only shows matching rows from both tables."],
    tags: ["JOIN", "INNER JOIN", "Multiple Tables"],
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "email", dataType: "TEXT" }
        ],
        rows: [
          { customer_id: 1, name: "Sarah Connor", email: "sarah@email.com" },
          { customer_id: 2, name: "John Doe", email: "john@email.com" },
          { customer_id: 3, name: "Jane Smith", email: "jane@email.com" },
          { customer_id: 4, name: "Mike Wilson", email: "mike@email.com" }
        ]
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "order_id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "total", dataType: "REAL" },
          { columnName: "order_date", dataType: "DATE" }
        ],
        rows: [
          { order_id: 101, customer_id: 1, total: 250.00, order_date: "2024-01-15" },
          { order_id: 102, customer_id: 2, total: 180.50, order_date: "2024-01-18" },
          { order_id: 103, customer_id: 1, total: 320.75, order_date: "2024-02-01" },
          { order_id: 104, customer_id: 3, total: 95.00, order_date: "2024-02-05" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Sarah Connor", total: 250.00 },
        { name: "John Doe", total: 180.50 },
        { name: "Sarah Connor", total: 320.75 },
        { name: "Jane Smith", total: 95.00 }
      ]
    }
  },
  {
    title: "Top 3 Highest Paid Employees",
    description: "Use ORDER BY and LIMIT to rank and paginate results.",
    difficulty: "Easy",
    question: "Find the top 3 highest-paid employees. Return their name and salary, sorted by salary in descending order.",
    hints: ["ORDER BY sorts results.", "LIMIT restricts how many rows are returned."],
    tags: ["ORDER BY", "LIMIT", "Sorting"],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", salary: 95000 },
          { id: 2, name: "Bob Smith", salary: 72000 },
          { id: 3, name: "Carol White", salary: 88000 },
          { id: 4, name: "David Lee", salary: 65000 },
          { id: 5, name: "Emma Davis", salary: 78000 },
          { id: 6, name: "Frank Brown", salary: 102000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Frank Brown", salary: 102000 },
        { name: "Alice Johnson", salary: 95000 },
        { name: "Carol White", salary: 88000 }
      ]
    }
  },
  {
    title: "Subquery: Above Average Salary",
    description: "Use a subquery to compare individual values against an aggregate.",
    difficulty: "Hard",
    question: "Find all employees whose salary is above the company-wide average salary. Return their name, department, and salary.",
    hints: ["A subquery runs a query inside another query.", "You can use the result of a subquery in a WHERE condition."],
    tags: ["Subquery", "AVG", "Advanced"],
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "TEXT" },
          { columnName: "department", dataType: "TEXT" },
          { columnName: "salary", dataType: "REAL" }
        ],
        rows: [
          { id: 1, name: "Alice Johnson", department: "Engineering", salary: 95000 },
          { id: 2, name: "Bob Smith", department: "Marketing", salary: 72000 },
          { id: 3, name: "Carol White", department: "Engineering", salary: 88000 },
          { id: 4, name: "David Lee", department: "HR", salary: 65000 },
          { id: 5, name: "Emma Davis", department: "Marketing", salary: 78000 },
          { id: 6, name: "Frank Brown", department: "Engineering", salary: 102000 }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { name: "Alice Johnson", department: "Engineering", salary: 95000 },
        { name: "Carol White", department: "Engineering", salary: 88000 },
        { name: "Frank Brown", department: "Engineering", salary: 102000 }
      ]
    }
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not set in .env file!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log('🗑️  Cleared existing assignments');

    // Insert sample assignments
    const inserted = await Assignment.insertMany(sampleAssignments);
    console.log(`✅ Inserted ${inserted.length} sample assignments`);
    
    console.log('\nAssignments created:');
    inserted.forEach(a => console.log(`  - [${a.difficulty}] ${a.title}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Seed complete! You can now start the server.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
