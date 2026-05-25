export interface User {
  id: string;
  name: string;
  age: number;
  title: string;
  avatar: string;
  color: string;
  streak: number;
  dailyMinutes: number;
  dailyGoalMinutes: number;
}

export const USERS: User[] = [
  {
    id: "pink",
    name: "Pink",
    age: 13,
    title: "Advanced STEAM Scholar",
    avatar: "🎓",
    color: "pink",
    streak: 7,
    dailyMinutes: 15,
    dailyGoalMinutes: 30,
  },
  {
    id: "rosie",
    name: "Rosie",
    age: 10,
    title: "Rising Star Creator",
    avatar: "⭐",
    color: "purple",
    streak: 3,
    dailyMinutes: 10,
    dailyGoalMinutes: 30,
  },
];
