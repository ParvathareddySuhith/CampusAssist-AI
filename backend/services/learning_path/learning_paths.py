# Predefined static learning path definitions for core computer science subjects

LEARNING_PATHS = {
    "DBMS": {
        "difficulty": "INTERMEDIATE",
        "estimated_total_minutes": 480,
        "recommended_resources": [
            "Database System Concepts by Silberschatz, Korth, Sudarshan",
            "GeeksforGeeks DBMS Section",
            "SQLBolt Interactive SQL Exercises"
        ],
        "steps": [
            {
                "id": "dbms_intro",
                "title": "Introduction to DBMS",
                "description": "Learn the basics of databases, file systems vs DBMS, three-schema architecture, and data independence.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "dbms_er",
                "title": "Entity-Relationship Model",
                "description": "Understand entities, attributes, relationships, ER diagram notations, keys, and mapping cardinalities.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["dbms_intro"]
            },
            {
                "id": "dbms_relational",
                "title": "Relational Model & Algebra",
                "description": "Study relational model concepts, schema constraints, tuple relational calculus, and relational algebra operations.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["dbms_er"]
            },
            {
                "id": "dbms_sql",
                "title": "SQL Queries & Joins",
                "description": "Learn SQL basics, DDL/DML commands, aggregate operations, joins (inner, outer, cross), and nested subqueries.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["dbms_relational"]
            },
            {
                "id": "dbms_normalization",
                "title": "Functional Dependencies & Normalization",
                "description": "Understand functional dependencies, closure sets, candidate key derivation, and normal forms (1NF, 2NF, 3NF, BCNF).",
                "estimated_minutes": 105,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["dbms_relational"]
            },
            {
                "id": "dbms_transactions",
                "title": "Transaction Management",
                "description": "Learn transaction concepts, ACID properties, schedule types, and conflict vs view serializability.",
                "estimated_minutes": 60,
                "difficulty": "ADVANCED",
                "prerequisites": ["dbms_normalization"]
            },
            {
                "id": "dbms_concurrency",
                "title": "Concurrency Control & Recovery Systems",
                "description": "Explore lock-based (2PL) and timestamp-based protocols, deadlocks, logging, checkpoints, and recovery algorithms.",
                "estimated_minutes": 60,
                "difficulty": "ADVANCED",
                "prerequisites": ["dbms_transactions"]
            }
        ]
    },
    "Operating Systems": {
        "difficulty": "ADVANCED",
        "estimated_total_minutes": 525,
        "recommended_resources": [
            "Operating System Concepts by Silberschatz, Galvin, Gagne",
            "Modern Operating Systems by Andrew S. Tanenbaum",
            "Neso Academy OS Playlist"
        ],
        "steps": [
            {
                "id": "os_intro",
                "title": "OS Overview & System Calls",
                "description": "Understand what an OS does, types of OS, dual-mode operations, interrupts, and system call interfaces.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "os_processes",
                "title": "Process Management & Threads",
                "description": "Study process concepts, state transitions, PCB blocks, context switching, inter-process communication (IPC), and thread basics.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["os_intro"]
            },
            {
                "id": "os_scheduling",
                "title": "CPU Scheduling Algorithms",
                "description": "Analyze preemption and scheduling policies including FCFS, SJF, SRTF, Round Robin, and Priority Scheduling.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["os_processes"]
            },
            {
                "id": "os_synchronization",
                "title": "Process Synchronization",
                "description": "Explore critical section problems, race conditions, Peterson's solution, semaphores, mutexes, and classical sync problems.",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["os_processes"]
            },
            {
                "id": "os_deadlocks",
                "title": "Deadlock Handling",
                "description": "Learn standard deadlock characterization, prevention, avoidance methods (Banker's Algorithm), and detection/recovery techniques.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["os_synchronization"]
            },
            {
                "id": "os_memory",
                "title": "Memory Management & Paging",
                "description": "Study logical vs physical address spaces, contiguous allocation, fragmentation, paging structures, and segmentation.",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["os_intro"]
            },
            {
                "id": "os_virtual_memory",
                "title": "Virtual Memory & Page Replacement",
                "description": "Learn demand paging, page faults, thrashing, and page replacement algorithms (FIFO, Optimal, LRU).",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["os_memory"]
            }
        ]
    },
    "Java": {
        "difficulty": "BEGINNER",
        "estimated_total_minutes": 375,
        "recommended_resources": [
            "Head First Java by Kathy Sierra & Bert Bates",
            "Core Java Volume I Fundamentals by Cay S. Horstmann",
            "Oracle Official Java Tutorials"
        ],
        "steps": [
            {
                "id": "java_intro",
                "title": "Java Basics & JVM Architecture",
                "description": "Understand JVM, JRE, and JDK internals, basic syntax, primitive data types, variables, and control statements.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "java_oop",
                "title": "Object-Oriented Programming in Java",
                "description": "Practice classes, objects, constructors, overloading, inheritance, overriding, interfaces, and abstract classes.",
                "estimated_minutes": 90,
                "difficulty": "BEGINNER",
                "prerequisites": ["java_intro"]
            },
            {
                "id": "java_exceptions",
                "title": "Exception Handling",
                "description": "Learn checked vs unchecked exceptions, try-catch-finally statements, custom exception classes, and throw/throws.",
                "estimated_minutes": 45,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["java_intro"]
            },
            {
                "id": "java_collections",
                "title": "Java Collections Framework",
                "description": "Master lists, sets, maps, collection interfaces, ListIterator, and generics implementation.",
                "estimated_minutes": 105,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["java_oop"]
            },
            {
                "id": "java_multithreading",
                "title": "Multithreading & Concurrency",
                "description": "Explore Thread class, Runnable interface, thread lifecycle, synchronization, locks, and thread pools.",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["java_collections"]
            }
        ]
    },
    "Python": {
        "difficulty": "BEGINNER",
        "estimated_total_minutes": 315,
        "recommended_resources": [
            "Python Crash Course by Eric Matthes",
            "Fluent Python by Luciano Ramalho",
            "Real Python Interactive Guides"
        ],
        "steps": [
            {
                "id": "py_intro",
                "title": "Python Basics & Core Types",
                "description": "Learn variable bindings, basic operators, lists, tuples, dictionaries, sets, loops, and conditions.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "py_funcs",
                "title": "Functions & Modules",
                "description": "Learn parameter passing, scope, lambda forms, list comprehensions, importing built-in modules, and package layouts.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["py_intro"]
            },
            {
                "id": "py_oop",
                "title": "Object-Oriented Python",
                "description": "Learn classes, attributes, self parameter, inheritance, magic methods (__init__, __str__), and duck typing.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["py_funcs"]
            },
            {
                "id": "py_files",
                "title": "File Handling & Exceptions",
                "description": "Learn file I/O operations, with block context managers, try-except-finally blocks, and raising custom errors.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["py_funcs"]
            },
            {
                "id": "py_advanced",
                "title": "Decorators, Generators & Contexts",
                "description": "Understand closures, writing custom decorators, generators with yield, iterator protocols, and custom context managers.",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["py_oop"]
            }
        ]
    },
    "CN": {
        "difficulty": "INTERMEDIATE",
        "estimated_total_minutes": 420,
        "recommended_resources": [
            "Computer Networking: A Top-Down Approach by Kurose & Ross",
            "Computer Networks by Andrew S. Tanenbaum",
            "Neso Academy Computer Networks Series"
        ],
        "steps": [
            {
                "id": "cn_models",
                "title": "Network Architecture & Reference Models",
                "description": "Understand network topologies, LAN/WAN basics, OSI reference model layers, and TCP/IP protocol suite comparison.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "cn_datalink",
                "title": "Data Link Layer & LAN Standards",
                "description": "Learn framing, error control (CRC), flow control, multiple access protocols (CSMA/CD), switches, and Ethernet.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["cn_models"]
            },
            {
                "id": "cn_network",
                "title": "Network Layer & IPv4/IPv6 Addressing",
                "description": "Study IP addressing, CIDR notation, subnetting, packets routing, ICMP, and NAT structures.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["cn_models"]
            },
            {
                "id": "cn_routing",
                "title": "Routing Protocols",
                "description": "Understand routing strategies, distance-vector vs link-state routing, RIP, OSPF, and BGP architectures.",
                "estimated_minutes": 75,
                "difficulty": "ADVANCED",
                "prerequisites": ["cn_network"]
            },
            {
                "id": "cn_transport",
                "title": "Transport Layer - TCP vs UDP",
                "description": "Study ports, UDP multiplexing, TCP segment structure, connection handshake, flow control, and sliding window mechanisms.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["cn_network"]
            },
            {
                "id": "cn_application",
                "title": "Application Layer Protocols",
                "description": "Learn DNS namespace, HTTP request/response flows, FTP structures, SMTP/IMAP, and socket communication concepts.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["cn_transport"]
            }
        ]
    },
    "DSA": {
        "difficulty": "ADVANCED",
        "estimated_total_minutes": 600,
        "recommended_resources": [
            "Introduction to Algorithms by Cormen, Leiserson, Rivest, Stein",
            "Data Structures and Algorithms in Java by Robert Lafore",
            "LeetCode Coding Practices"
        ],
        "steps": [
            {
                "id": "dsa_arrays",
                "title": "Arrays & Linked Lists",
                "description": "Learn static vs dynamic arrays, single/double/circular linked lists, operations, and space-time complexity analysis.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "dsa_stacks",
                "title": "Stacks & Queues",
                "description": "Implement stacks, queues, double-ended queues (deque), priority queues, and applications (expression parsing).",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["dsa_arrays"]
            },
            {
                "id": "dsa_complexity",
                "title": "Asymptotic Analysis & Sorting",
                "description": "Analyze Big-O notation, worst/average/best cases, and sorting algorithms (Bubble, Insertion, Quick, Merge, Heap).",
                "estimated_minutes": 90,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "dsa_recursion",
                "title": "Recursion & Backtracking",
                "description": "Learn recursive function execution stack, divide and conquer strategy, and backtracking solver algorithms (N-Queens, Sudoku).",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["dsa_complexity"]
            },
            {
                "id": "dsa_trees",
                "title": "Trees & Binary Search Trees (BST)",
                "description": "Explore tree representations, binary trees, traversal strategies (Inorder, Preorder, Postorder, BFS), and BST structures.",
                "estimated_minutes": 100,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["dsa_recursion"]
            },
            {
                "id": "dsa_graphs",
                "title": "Graph Algorithms",
                "description": "Understand graph structures (adjacency list/matrix), DFS, BFS, shortest path algorithms (Dijkstra, Bellman-Ford), and MST.",
                "estimated_minutes": 100,
                "difficulty": "ADVANCED",
                "prerequisites": ["dsa_trees"]
            },
            {
                "id": "dsa_dp",
                "title": "Dynamic Programming",
                "description": "Master memoization vs tabulation, subproblem dependency, and classical DP problems (0/1 Knapsack, LCS).",
                "estimated_minutes": 100,
                "difficulty": "ADVANCED",
                "prerequisites": ["dsa_recursion"]
            }
        ]
    },
    "OOP": {
        "difficulty": "BEGINNER",
        "estimated_total_minutes": 315,
        "recommended_resources": [
            "Object-Oriented Analysis and Design by Grady Booch",
            "Head First Design Patterns by Eric Freeman",
            "Refactoring.Guru Design Patterns Guides"
        ],
        "steps": [
            {
                "id": "oop_basics",
                "title": "Classes & Objects",
                "description": "Learn the conceptual basis of objects, class structures, instance properties, constructors, and class-level methods.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "oop_pillars",
                "title": "The Four Pillars of OOP",
                "description": "Master Encapsulation, Abstraction, Inheritance, and Polymorphism (runtime and compile-time forms).",
                "estimated_minutes": 90,
                "difficulty": "BEGINNER",
                "prerequisites": ["oop_basics"]
            },
            {
                "id": "oop_relationships",
                "title": "Class Relationships & UML",
                "description": "Study Association, Aggregation, Composition, Dependency, and modeling them in UML diagrams.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["oop_basics"]
            },
            {
                "id": "oop_solid",
                "title": "SOLID Design Principles",
                "description": "Understand Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion rules.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["oop_pillars"]
            },
            {
                "id": "oop_patterns",
                "title": "Design Patterns Overview",
                "description": "Introduction to Creational (Singleton, Factory), Structural (Adapter), and Behavioral (Observer) design patterns.",
                "estimated_minutes": 60,
                "difficulty": "ADVANCED",
                "prerequisites": ["oop_solid"]
            }
        ]
    },
    "React": {
        "difficulty": "INTERMEDIATE",
        "estimated_total_minutes": 390,
        "recommended_resources": [
            "React Official Beta Documentation (react.dev)",
            "React Key Concepts by Maximilian Schwarzmüller",
            "Scrimba Frontend Development Course"
        ],
        "steps": [
            {
                "id": "react_components",
                "title": "JSX, Virtual DOM & Components",
                "description": "Understand JSX parsing, Virtual DOM diffing, rendering pipelines, and building functional components.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "react_props_state",
                "title": "Props & State Management",
                "description": "Learn immutable component props, managing component state, dynamic list rendering, and event propagation.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["react_components"]
            },
            {
                "id": "react_hooks",
                "title": "Lifecycle & State Hooks (useEffect)",
                "description": "Master useEffect dependency arrays, component cleanups, custom state hooks, and fetching API data.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["react_props_state"]
            },
            {
                "id": "react_router",
                "title": "React Router & Navigation",
                "description": "Integrate routing systems, Route paths, route parameters, NavLinks, and programmatic redirects.",
                "estimated_minutes": 90,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["react_components"]
            },
            {
                "id": "react_context",
                "title": "Context API & Global States",
                "description": "Solve prop drilling using React Context, Context.Provider structures, and writing custom useContext hooks.",
                "estimated_minutes": 90,
                "difficulty": "ADVANCED",
                "prerequisites": ["react_hooks"]
            }
        ]
    },
    "SQL": {
        "difficulty": "BEGINNER",
        "estimated_total_minutes": 270,
        "recommended_resources": [
            "SQLBolt Interactive SQL Exercises",
            "SQL Zoo Tutorial Exercises",
            "Mode Analytics SQL Tutorial Guide"
        ],
        "steps": [
            {
                "id": "sql_select",
                "title": "SQL SELECT Queries & Filtering",
                "description": "Learn SELECT statement structure, WHERE conditional expressions, logical operators, and result ordering.",
                "estimated_minutes": 45,
                "difficulty": "BEGINNER",
                "prerequisites": []
            },
            {
                "id": "sql_aggregates",
                "title": "Aggregate Functions & GROUP BY",
                "description": "Learn aggregate functions (SUM, AVG, COUNT, MIN, MAX), GROUP BY clause syntax, and filtering aggregates with HAVING.",
                "estimated_minutes": 60,
                "difficulty": "BEGINNER",
                "prerequisites": ["sql_select"]
            },
            {
                "id": "sql_joins",
                "title": "SQL JOINS",
                "description": "Master relational database connections using INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, and SELF JOIN concepts.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["sql_select"]
            },
            {
                "id": "sql_subqueries",
                "title": "Subqueries & Common Table Expressions (CTEs)",
                "description": "Write nested subqueries inside SELECT, FROM, or WHERE clauses, and construct readable CTE queries using the WITH statement.",
                "estimated_minutes": 60,
                "difficulty": "INTERMEDIATE",
                "prerequisites": ["sql_joins"]
            },
            {
                "id": "sql_indexes",
                "title": "Indexes & Performance Optimization",
                "description": "Learn index architecture, Clustered vs Non-Clustered indexing, EXPLAIN plan utility, and simple search queries optimization.",
                "estimated_minutes": 45,
                "difficulty": "ADVANCED",
                "prerequisites": ["sql_select"]
            }
        ]
    }
}


GENERIC_PATH_STEPS = [
    {
        "id": "generic_intro",
        "title": "Introduction to {topic}",
        "description": "Learn the basic foundations, overview, and introductory definitions of {topic}.",
        "estimated_minutes": 30,
        "difficulty": "BEGINNER",
        "prerequisites": []
    },
    {
        "id": "generic_core",
        "title": "Core Concepts & Fundamentals",
        "description": "Understand the central theories, building blocks, and architectural rules governing {topic}.",
        "estimated_minutes": 60,
        "difficulty": "BEGINNER",
        "prerequisites": ["generic_intro"]
    },
    {
        "id": "generic_examples",
        "title": "Practical Examples & Workthroughs",
        "description": "Study code examples, implementations, and sample designs involving {topic}.",
        "estimated_minutes": 60,
        "difficulty": "INTERMEDIATE",
        "prerequisites": ["generic_core"]
    },
    {
        "id": "generic_practice",
        "title": "Hands-on Practice & Exercises",
        "description": "Solve exercise problems and apply {topic} principles to complete simple projects.",
        "estimated_minutes": 90,
        "difficulty": "INTERMEDIATE",
        "prerequisites": ["generic_examples"]
    },
    {
        "id": "generic_advanced",
        "title": "Advanced Topics & Best Practices",
        "description": "Explore high-level strategies, complex setups, and design optimizations for {topic}.",
        "estimated_minutes": 120,
        "difficulty": "ADVANCED",
        "prerequisites": ["generic_practice"]
    },
    {
        "id": "generic_revision",
        "title": "Revision & Summary",
        "description": "Consolidate your knowledge, review core structures, and complete a final summary of {topic}.",
        "estimated_minutes": 45,
        "difficulty": "BEGINNER",
        "prerequisites": ["generic_advanced"]
    }
]
