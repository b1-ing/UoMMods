# UoMMods

A comprehensive course management and planning system designed specifically for University of Manchester students to optimize their academic journey through intelligent module selection and workload management.

## 🎓 About

UoMMods is a full-stack web application that helps University of Manchester students make informed decisions about their course modules. The system provides powerful tools for course planning, workload analysis, and academic optimization through data-driven insights.

### Key Features

- **Assessment Splitting**: Break down module assessments into manageable components with detailed weighting analysis
- **Course Program Optimization**: Intelligent algorithms to suggest optimal module combinations based on workload, prerequisites, and academic goals
- **Fuzzy Search**: Advanced search capabilities to quickly find modules, courses, and related content
- **Summary Tables**: Comprehensive overview of module information including credits, assessment types, and historical performance
- **Program Dependency Graphs**: Visual representation of module prerequisites and program pathways
- **Interactive Workload Charts**: Visual comparison of lectures, labs, study hours, and placements
- **Grade Insights**: Historical grade distributions and performance analytics
- **Real-time Data Sync**: Automated scraping ensures up-to-date course information

## 🏗️ Technical Stack

### Frontend (Next.js Application)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Visualization**: React Flow for dependency graphs, Recharts for analytics
- **Search**: Fuse.js for fuzzy searching capabilities
- **State Management**: React hooks with Context API
- **Authentication**: Iron Session with University of Manchester SSO integration

### Backend & Data
- **Database**: Supabase (PostgreSQL) for real-time data synchronization
- **Scraping**: Python with BeautifulSoup4 and Requests for data collection
- **Data Processing**: Pandas for data analysis and CSV/JSON exports
- **APIs**: RESTful APIs with Next.js API routes

### Development Tools
- **Language**: TypeScript for type safety
- **Bundler**: Turbopack for fast development builds
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) 
- **Python** (v3.8 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/UoMMods.git
   cd UoMMods
   ```

2. **Set up Python environment (for data scraping)**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Set up Next.js application**
   ```bash
   cd uommods
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy the environment template
   cp .env.template .env.local
   
   # Edit .env.local with your configuration
   # Generate session password: openssl rand -base64 60
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - The application will be running with hot-reload enabled

### Data Scraping Setup

To update course data from University of Manchester sources:

1. **Configure scraping environment**
   ```bash
   # Ensure Python virtual environment is activated
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. **Run course data scraper**
   ```bash
   python scrape_course_data.py
   ```

3. **Process marks data** (if PDF available)
   ```bash
   python marks_scraper.py
   ```

## 🧪 Development

### Build Commands
```bash
# Build Next.js application for production
cd uommods
npm run build
```

### Linting
```bash
# Run ESLint
cd uommods
npm run lint
```

### Testing
Currently, no automated testing framework is configured. Manual testing guidelines:

1. **Frontend Testing**: Test all user interactions in the course planner
2. **Data Integrity**: Verify scraped data accuracy against university sources
3. **Performance**: Monitor page load times and search responsiveness
4. **Accessibility**: Ensure proper keyboard navigation and screen reader support

## 📊 Data Sources

The system maintains up-to-date course information through automated scraping of:

- University of Manchester course catalogues
- Module descriptions and requirements
- Assessment breakdowns and weightings
- Historical grade distributions
- Prerequisite and corequisite relationships

Data is processed and stored in Supabase for real-time access and synchronization across the application.

## 🤝 Contributing

We welcome contributions from the University of Manchester community and beyond!

### Code Standards

- **TypeScript**: Use strict typing, avoid `any` types
- **React**: Use functional components with hooks
- **Styling**: Follow Tailwind CSS conventions, use Radix UI components
- **Python**: Follow PEP 8 guidelines for scraping scripts
- **Git**: Use conventional commit messages

### Pull Request Process

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code standards above

3. **Test your changes**
   - Run linting: `npm run lint`
   - Build the application: `npm run build`
   - Test functionality manually

4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork and submit a pull request**
   - Provide a clear description of changes
   - Link any related issues
   - Include screenshots for UI changes

### Development Guidelines

- **Performance**: Ensure new features don't significantly impact load times
- **Accessibility**: Test with keyboard navigation and screen readers
- **Mobile**: Verify responsive design on various screen sizes
- **Data Privacy**: Never commit real student data or credentials
- **Security**: Follow security best practices for authentication and data handling

## 📄 License

This project is developed for educational purposes at the University of Manchester. Please respect university policies and student data privacy when contributing.

## 🙏 Acknowledgments

- University of Manchester for providing course data sources
- The student community for feedback and feature requests
- Open source contributors and maintainers

## 📧 Contact

**Developer**: Brendan Ling  
**Email**: brendan.ling@student.manchester.ac.uk  
**University**: University of Manchester

---

*UoMMods is an independent student project and is not officially affiliated with the University of Manchester.*