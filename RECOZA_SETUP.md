# Recoza - Green-Tech Recycling Platform

## Overview
Recoza is a mobile application connecting unemployed youth in South Africa with recycling collection opportunities, enabling them to earn income while formalizing community recycling efforts.

## Key Features

### User Models
- **Households**: All users start as households who log recyclable items
- **Collectors**: Households can apply to become collectors who manage collection schedules
- **Dual Role**: Approved collectors can act as both household and collector

### Core Functionality

#### Home Screen
- Dashboard showing weekly earnings estimates
- Quick view of logged items (households) or upcoming collections (collectors)
- Profile overview

#### Collections Tab
- **Households**: Log and track recyclable items with quantities and weights
- **Collectors**: View scheduled collections and manage pickups
- Item categories: Plastic, Cardboard, Paper, Glass, Aluminum, Mixed Plastics
- Real-time earnings calculation based on item weight

#### Profile Screen
- Account information and role management
- **Collector Features**:
  - Generate unique invite codes to recruit households
  - Share codes with friends, family, and neighbors
  - Track application status
- **Application System**:
  - Submit motivation and service area
  - Await admin review and approval
  - Notifications on application status

### Authentication
- Email/password signup with Supabase
- Optional collector invite code during registration
- Auto-linking to collector when using their invite code

## Database Schema

### Core Tables
- **user_profiles**: User account information and roles
- **collector_applications**: Track collector applications and approval status
- **recyclable_types**: Inventory of recyclable item categories
- **logged_items**: Household items awaiting collection
- **collections**: Scheduled collection events with earnings

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Collectors can access their linked households' information

## Design Principles
- Green color scheme (#059669 primary, neutrals for contrast)
- Icon-based navigation (no emojis)
- Simple, friendly interface
- Easy-to-use onboarding flow
- Clean typography with strong hierarchy

## Navigation
- **Bottom Tab Navigation**: Home, Collections, Profile
- **Authentication Flow**: Onboarding → Signup/Login → Main App
- Stack-based routing for better UX

## Deployment
- Built with Expo and React Native
- Web-first platform support
- Supabase backend for database and authentication
- Ready for iOS/Android native builds

## Getting Started
1. Users sign up with email and name
2. Optional: Enter collector invite code if joining someone's network
3. Access home screen showing dashboard
4. Log recyclable items or apply as collector
5. Track earnings and schedule collections
