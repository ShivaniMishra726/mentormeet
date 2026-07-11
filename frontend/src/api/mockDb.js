// Helper to get formatted dates relative to today
const getRelativeDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_MENTORS = [
  {
    id: "mentor-marcus",
    email: "mentor1@example.com",
    name: "Marcus Vance",
    role: "mentor",
    bio: "Former Staff Engineer at Stripe. Specialized in high-scale Distributed Systems, API Architecture, and database optimization. Passionate about helping developers transition into senior roles.",
    experience: "12 years in Backend Infrastructure",
    skills: ["System Design", "Go", "Distributed Systems", "PostgreSQL", "Kubernetes", "API Design"],
    rating: 4.9,
    reviewsCount: 42,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: "mentor-sarah",
    email: "mentor2@example.com",
    name: "Sarah Jenkins",
    role: "mentor",
    bio: "Lead Product Designer at Airbnb. Focuses on design portfolios, UI/UX interaction systems, and user research methodologies. Love working with self-taught designers and engineers looking to build visual intuition.",
    experience: "8 years in Product Design",
    skills: ["Product Design", "Figma", "User Research", "Interaction Design", "Design Systems", "Prototyping"],
    rating: 4.8,
    reviewsCount: 31,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    id: "mentor-david",
    email: "mentor3@example.com",
    name: "David Kim",
    role: "mentor",
    bio: "Senior Engineering Manager at Google. Focusing on leadership coaching, technical interview prep (algorithmic & system design), and resume reviews that stand out in competitive processes.",
    experience: "10 years in Engineering Management",
    skills: ["Career Growth", "Resume Review", "Behavioral Interview", "Algorithms", "Java", "Python"],
    rating: 5.0,
    reviewsCount: 56,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

const INITIAL_STUDENTS = [
  {
    email: "student@example.com",
    name: "Alex Chen",
    role: "student"
  },
  {
    email: "jane@example.com",
    name: "Jane Doe",
    role: "student"
  }
];

// Seed initial availability slots for the next 4 days
const generateInitialSlots = () => {
  const slots = {};
  const times = ["09:00 - 10:00", "10:30 - 11:30", "13:00 - 14:00", "14:30 - 15:30", "16:00 - 17:00"];
  
  INITIAL_MENTORS.forEach(mentor => {
    slots[mentor.email] = [];
    // Generate slots for today (day 0) through day 3
    for (let day = 0; day <= 3; day++) {
      const dateStr = getRelativeDateString(day);
      times.forEach((time, index) => {
        // Distribute statuses: mix of available, booked, and unavailable
        let status = "available";
        let bookedBy = null;
        
        if (day === 0 && index === 0) {
          // Today, first slot booked by student@example.com
          status = "booked";
          bookedBy = "student@example.com";
        } else if (day === 0 && index === 2) {
          // Today, third slot unavailable
          status = "unavailable";
        } else if (day === 1 && index === 1) {
          // Tomorrow, second slot booked by student@example.com
          status = "booked";
          bookedBy = "student@example.com";
        } else if (day === 1 && index === 3) {
          status = "booked";
          bookedBy = "jane@example.com";
        } else if (day === 2 && index === 4) {
          status = "unavailable";
        }
        
        slots[mentor.email].push({
          id: `${mentor.id}-${dateStr}-${index}`,
          date: dateStr,
          time: time,
          status: status,
          bookedBy: bookedBy
        });
      });
    }
  });
  return slots;
};

// Seed booking list based on seed slots
const generateInitialBookings = (slots) => {
  const bookings = [];
  
  // Add some past bookings
  bookings.push({
    id: "booking-past-1",
    studentEmail: "student@example.com",
    mentorEmail: "mentor1@example.com",
    mentorName: "Marcus Vance",
    mentorAvatar: INITIAL_MENTORS[0].avatar,
    studentName: "Alex Chen",
    date: getRelativeDateString(-2),
    time: "10:30 - 11:30",
    status: "past"
  });
  
  bookings.push({
    id: "booking-cancelled-1",
    studentEmail: "student@example.com",
    mentorEmail: "mentor2@example.com",
    mentorName: "Sarah Jenkins",
    mentorAvatar: INITIAL_MENTORS[1].avatar,
    studentName: "Alex Chen",
    date: getRelativeDateString(-1),
    time: "14:30 - 15:30",
    status: "cancelled"
  });

  // Pull booked slots from slots structure
  Object.keys(slots).forEach(mentorEmail => {
    const mentor = INITIAL_MENTORS.find(m => m.email === mentorEmail);
    slots[mentorEmail].forEach(slot => {
      if (slot.status === "booked") {
        const student = INITIAL_STUDENTS.find(s => s.email === slot.bookedBy) || { name: "Another Student" };
        bookings.push({
          id: `booking-${slot.id}`,
          studentEmail: slot.bookedBy,
          mentorEmail: mentorEmail,
          mentorName: mentor.name,
          mentorAvatar: mentor.avatar,
          studentName: student.name,
          date: slot.date,
          time: slot.time,
          status: "upcoming"
        });
      }
    });
  });
  
  return bookings;
};

export const initDb = () => {
  if (!localStorage.getItem("mentormeet_users")) {
    // Seed mentors and students into users list
    const users = [
      ...INITIAL_STUDENTS.map(u => ({ ...u, password: "password" })),
      ...INITIAL_MENTORS.map(m => ({ ...m, password: "password" }))
    ];
    localStorage.setItem("mentormeet_users", JSON.stringify(users));
  }
  
  if (!localStorage.getItem("mentormeet_mentors")) {
    localStorage.setItem("mentormeet_mentors", JSON.stringify(INITIAL_MENTORS));
  }
  
  if (!localStorage.getItem("mentormeet_slots")) {
    const slots = generateInitialSlots();
    localStorage.setItem("mentormeet_slots", JSON.stringify(slots));
    
    // Initial bookings can only be generated once slots are set
    const bookings = generateInitialBookings(slots);
    localStorage.setItem("mentormeet_bookings", JSON.stringify(bookings));
  }
};

// Database utility methods
export const db = {
  getUsers: () => JSON.parse(localStorage.getItem("mentormeet_users") || "[]"),
  
  saveUsers: (users) => localStorage.setItem("mentormeet_users", JSON.stringify(users)),
  
  getMentors: () => JSON.parse(localStorage.getItem("mentormeet_mentors") || "[]"),
  
  getSlots: () => JSON.parse(localStorage.getItem("mentormeet_slots") || "{}"),
  
  saveSlots: (slots) => localStorage.setItem("mentormeet_slots", JSON.stringify(slots)),
  
  getBookings: () => JSON.parse(localStorage.getItem("mentormeet_bookings") || "[]"),
  
  saveBookings: (bookings) => localStorage.setItem("mentormeet_bookings", JSON.stringify(bookings)),
  
  login: (email, password) => {
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  register: (name, email, password, role) => {
    const users = db.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }
    
    const newUser = { name, email, password, role };
    
    if (role === "mentor") {
      // Create a default mentor record
      newUser.id = `mentor-${Date.now()}`;
      newUser.bio = "New Mentor joining MentorMeet. Experienced industry professional ready to guide students.";
      newUser.experience = "5 years in Industry";
      newUser.skills = ["Software Engineering", "Career Development"];
      newUser.rating = 5.0;
      newUser.reviewsCount = 0;
      newUser.avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200";
      
      // Update mentor list
      const mentors = db.getMentors();
      mentors.push({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: "mentor",
        bio: newUser.bio,
        experience: newUser.experience,
        skills: newUser.skills,
        rating: newUser.rating,
        reviewsCount: newUser.reviewsCount,
        avatar: newUser.avatar
      });
      localStorage.setItem("mentormeet_mentors", JSON.stringify(mentors));
      
      // Initialize empty slots for the new mentor
      const slots = db.getSlots();
      slots[newUser.email] = [];
      // Generate slots for next 4 days
      const times = ["09:00 - 10:00", "10:30 - 11:30", "13:00 - 14:00", "14:30 - 15:30", "16:00 - 17:00"];
      for (let day = 0; day <= 3; day++) {
        const dateStr = getRelativeDateString(day);
        times.forEach((time, index) => {
          slots[newUser.email].push({
            id: `${newUser.id}-${dateStr}-${index}`,
            date: dateStr,
            time: time,
            status: "available",
            bookedBy: null
          });
        });
      }
      db.saveSlots(slots);
    } else {
      newUser.role = "student";
    }
    
    users.push(newUser);
    db.saveUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  bookSlot: (studentEmail, studentName, mentorEmail, slotId) => {
    const slots = db.getSlots();
    const mentorSlots = slots[mentorEmail] || [];
    const slot = mentorSlots.find(s => s.id === slotId);
    
    if (!slot) throw new Error("Slot not found");
    if (slot.status !== "available") throw new Error("Slot is already booked or unavailable");
    
    // Update slot
    slot.status = "booked";
    slot.bookedBy = studentEmail;
    db.saveSlots(slots);
    
    // Create booking
    const mentors = db.getMentors();
    const mentor = mentors.find(m => m.email === mentorEmail);
    const bookings = db.getBookings();
    const newBooking = {
      id: `booking-${slotId}`,
      studentEmail,
      mentorEmail,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      studentName,
      date: slot.date,
      time: slot.time,
      status: "upcoming"
    };
    bookings.push(newBooking);
    db.saveBookings(bookings);
    
    return newBooking;
  },
  
  cancelBooking: (bookingId) => {
    const bookings = db.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    
    // Update booking status
    booking.status = "cancelled";
    db.saveBookings(bookings);
    
    // Revert slot availability
    const slots = db.getSlots();
    const mentorSlots = slots[booking.mentorEmail] || [];
    // The slotId was encoded in booking.id, which is `booking-${slotId}`
    const slotId = bookingId.replace("booking-", "");
    const slot = mentorSlots.find(s => s.id === slotId);
    if (slot) {
      slot.status = "available";
      slot.bookedBy = null;
      db.saveSlots(slots);
    }
    
    return booking;
  },
  
  getMentorStats: (mentorEmail) => {
    const bookings = db.getBookings();
    const mentorBookings = bookings.filter(b => b.mentorEmail === mentorEmail);
    
    // Aggregate by date (count only non-cancelled bookings)
    const activeBookings = mentorBookings.filter(b => b.status !== "cancelled");
    const countsByDate = {};
    
    // Prefill last 4 days and next 4 days to make the chart look nice
    for (let i = -3; i <= 3; i++) {
      countsByDate[getRelativeDateString(i)] = 0;
    }
    
    activeBookings.forEach(b => {
      if (countsByDate[b.date] !== undefined) {
        countsByDate[b.date]++;
      } else {
        countsByDate[b.date] = 1;
      }
    });
    
    // Format for Recharts: [{ date: '07-05', count: 2 }]
    return Object.keys(countsByDate).sort().map(dateStr => {
      // Reformat date from YYYY-MM-DD to MM/DD for clean chart label
      const parts = dateStr.split('-');
      const label = `${parts[1]}/${parts[2]}`;
      return {
        date: label,
        fullDate: dateStr,
        bookings: countsByDate[dateStr]
      };
    });
  }
};
