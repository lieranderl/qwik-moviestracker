import { initializeApp } from "firebase/app";
import { Timestamp } from "firebase/firestore";
import {
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import type { MovieShort, MovieFirestore } from "./models";

const firebase_config = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const firebase_app = initializeApp(firebase_config);
const db = getFirestore(firebase_app);

type getMovieFirestoreType = {
  page: number;
  dbName: string;
  startTime: number;
};

export const getMoviesFirebase = async ({
  page,
  dbName,
  startTime,
}: getMovieFirestoreType) => {
  const lastmoviesRef = collection(db, dbName);
  const moviesQuery = query(
    lastmoviesRef,
    orderBy("LastTimeFound", "desc"),
    limit(page),
    startAfter(Timestamp.fromMillis(startTime))
  );
  const moviesSnapshot = await getDocs(moviesQuery);
  const movies: (MovieShort & MovieFirestore)[] = [];
  moviesSnapshot.forEach((doc) => {
    movies.push(doc.data() as MovieShort & MovieFirestore);
  });
  return movies;
};
