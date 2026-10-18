export interface Alumnus {
  id: string;
  name: string;
  position: string;
  gender: 'male' | 'female';
  session: string;
  department?: string;
  phone?: string;
  email?: string;
  currentRole?: string;
  company?: string;
  bio?: string;
}

export interface AlumniSession {
  session: string;
  start_year: number;
  end_year: number;
  members: Alumnus[];
}

export interface AlumniData {
  sessions: AlumniSession[];
}

export const sampleAlumniData: AlumniData = {
  sessions: []
};
