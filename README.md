# Restaurant Operations Briefing System

A comprehensive restaurant management system that generates AI-powered operational briefings for service managers. Built with FastAPI, React, MongoDB, and OpenAI GPT-4o.

## 🎯 Overview

This system acts as an experienced restaurant General Manager, analyzing operational data to provide clear, actionable insights for restaurant operators. It helps managers make better real-time decisions by connecting the dots across sales, staffing, and guest management.

## ✨ Features

### 📊 Dashboard
- **Service Intelligence Briefing**: AI-generated pre-shift operational briefings
- **Key Metrics Display**: 
  - Total reservations and covers
  - Expected guest range (including walk-ins)
  - Staff scheduled and total hours
  - Estimated labor costs
- **Date Selection**: Generate briefings for any future date

### 📅 Reservations Management
- Create, view, edit, and delete reservations
- Track party size, time, and special requests
- Filter by service date
- Status tracking (confirmed, cancelled, completed)
- Link reservations to guest profiles

### 👥 Guest Management
- Comprehensive guest profiles
- Track visit history and lifetime spending
- VIP status designation
- Dietary preferences and restrictions
- Contact information (phone, email)
- Custom notes for personalized service

### 👨‍🍳 Staff Management
- Employee roster management
- Position tracking (server, chef, host, bartender, manager)
- Hourly rate configuration
- Card-based view with quick actions

### 🕐 Staff Scheduling
- Shift planning by date
- Automatic hour calculation
- Real-time labor cost tracking
- Position-based scheduling
- Schedule summaries (total hours, total cost)

### ⚙️ Service Configuration
- Expected walk-in range settings
- Peak time period definition
- Service-specific notes
- Date-based configuration

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python)
- MongoDB with Motor (async driver)
- OpenAI GPT-4o via emergentintegrations
- Pydantic for data validation

**Frontend:**
- React 19
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Modern responsive UI

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI application with all endpoints
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables (includes EMERGENT_LLM_KEY)
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main application component
│   │   ├── App.css                   # Global styles
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   └── components/
│   │       ├── Dashboard.js          # Operations dashboard
│   │       ├── Reservations.js       # Reservations management
│   │       ├── Guests.js             # Guest management
│   │       ├── Staff.js              # Staff management
│   │       └── Schedules.js          # Staff scheduling
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend environment variables
└── README.md            # This file
```

## 🚀 API Endpoints

### Guests
- `POST /api/guests` - Create a new guest
- `GET /api/guests` - Get all guests
- `GET /api/guests/{id}` - Get specific guest
- `PUT /api/guests/{id}` - Update guest
- `DELETE /api/guests/{id}` - Delete guest

### Reservations
- `POST /api/reservations` - Create a new reservation
- `GET /api/reservations?service_date={date}` - Get reservations (optionally filtered by date)
- `GET /api/reservations/{id}` - Get specific reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Delete reservation

### Staff
- `POST /api/staff` - Create a new staff member
- `GET /api/staff` - Get all staff
- `GET /api/staff/{id}` - Get specific staff member
- `PUT /api/staff/{id}` - Update staff member
- `DELETE /api/staff/{id}` - Delete staff member

### Staff Schedules
- `POST /api/schedules` - Create a new schedule
- `GET /api/schedules?service_date={date}` - Get schedules (optionally filtered by date)
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Delete schedule

### Service Configuration
- `POST /api/service-config` - Create service configuration
- `GET /api/service-config?service_date={date}` - Get configuration for date
- `PUT /api/service-config/{date}` - Update configuration

### Briefing Generation
- `POST /api/generate-briefing` - Generate AI briefing for a service date
  ```json
  {
    "service_date": "2025-12-13"
  }
  ```

## 🤖 AI Briefing Format

The system generates briefings in a specific 5-section format:

1. **TITLE**: Service date display
2. **HEADLINE**: 1-2 sentence summary of the most important operational takeaway
3. **WHAT TONIGHT LOOKS LIKE**: Booked covers, expected guest range, peak periods
4. **STAFFING INSIGHT**: Staff alignment assessment, overtime risk, recommendations
5. **GUEST HIGHLIGHTS**: VIP and high-value guests requiring special attention
6. **SUGGESTED ACTIONS**: 2-3 clear, practical actions for the manager

### Briefing Characteristics:
- ✅ Operator-friendly language (no data analyst jargon)
- ✅ Cautious, realistic phrasing
- ✅ Connects operational dots across data
- ✅ 250-300 words maximum
- ✅ Actionable insights
- ✅ Never invents data

## 🔑 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-aDf53264bF776D36dC
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=<your-backend-url>
```

## 📝 Sample Data

The system includes sample data for testing:
- 3 Guests (including 1 VIP)
- 3 Reservations for today
- 3 Staff members (server, chef, host)
- 3 Staff schedules for today
- Service configuration for today

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Modal Forms**: Intuitive data entry
- **Color-Coded Badges**: Quick status identification
- **Real-time Calculations**: Automatic hour and cost calculations
- **Data Tables**: Sortable, filterable data views
- **Card Views**: Visual representation of data
- **Gradient Metrics**: Eye-catching dashboard statistics

## 🔄 Workflow

1. **Setup Guests**: Add guest profiles with preferences and history
2. **Add Staff**: Create employee roster with positions and rates
3. **Create Schedules**: Plan staff shifts for service dates
4. **Take Reservations**: Book tables and link to guest profiles
5. **Configure Service**: Set walk-in expectations and peak times
6. **Generate Briefing**: Get AI-powered operational intelligence
7. **Review & Act**: Use insights to optimize service delivery

## 🎯 Use Cases

- **Pre-Shift Meetings**: Share briefings with staff before service
- **Labor Planning**: Optimize staffing based on expected volume
- **VIP Service**: Ensure special guests receive proper attention
- **Cost Control**: Monitor labor costs in real-time
- **Operational Efficiency**: Make data-driven decisions quickly

## 🚦 System Status

All services running:
- ✅ Backend API (FastAPI on port 8001)
- ✅ Frontend (React on port 3000)
- ✅ MongoDB (port 27017)
- ✅ AI Integration (OpenAI GPT-4o via Emergent LLM Key)

## 📱 Access

- **Frontend**: Navigate through the UI using the top navigation bar
- **Backend API**: Available at `/api` prefix for all endpoints
- **Documentation**: This README and inline component documentation

## 🎓 Best Practices

1. **Keep Guest Data Updated**: Regular updates improve briefing quality
2. **Configure Service Daily**: Set walk-in expectations for accurate forecasting
3. **Review Schedules**: Ensure adequate staffing before generating briefings
4. **Act on Insights**: Use suggested actions to improve operations
5. **Track Metrics**: Monitor labor costs and guest satisfaction trends

## 🔐 Security Notes

- Guest data is stored securely in MongoDB
- API uses proper HTTP methods and status codes
- Environment variables for sensitive configuration
- CORS configured for frontend-backend communication

## 🎉 Ready to Use!

The system is fully operational with sample data. Start by:
1. Opening the dashboard
2. Reviewing the sample data
3. Generating your first briefing
4. Exploring the management interfaces

---

**Built with care for restaurant operators who deserve better tools.** 🍽️✨
