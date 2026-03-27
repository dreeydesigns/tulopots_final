'use client';

import LoggedInHome from '../components/home/LoggedInHome';
import LoggedOutHome from '../components/home/LoggedOutHome';
import { useStore } from '../components/Providers';

export default function Page() {
  const { isLoggedIn } = useStore();

  if (isLoggedIn) {
    return <LoggedInHome />;
  }

  return <LoggedOutHome />;
}