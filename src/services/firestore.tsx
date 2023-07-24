
import { initializeApp } from "firebase/app";
import { Timestamp} from "firebase/firestore";
import { getFirestore, limit, orderBy, query, startAfter } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore"; 

const firebase_config = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
const firebase_app = initializeApp(firebase_config);
const db = getFirestore(firebase_app);

// export const usersSnapshot = await getDocs(collection(db, "users"));

export type getMoviesIdsType = {
    page: number;
    dbName: string;
    startTime: number
}
export const getMoviesIds = async ({page, dbName, startTime}:getMoviesIdsType) => {

    const lastmoviesRef = collection(db, dbName)
    const moviesQuery = query(lastmoviesRef, orderBy("LastTimeFound", 'desc'), limit(page), startAfter(Timestamp.fromMillis(startTime)));
    const moviesSnapshot = await getDocs(moviesQuery);
    const moviesIds: {id:number, lastTimeFound:number}[] = [];
    moviesSnapshot.forEach((doc) => {
        moviesIds.push({id:doc.data().id, lastTimeFound: doc.data().LastTimeFound.toMillis()});
        });
    console.log(moviesIds.length);
    return moviesIds;
};

// const lastmoviesRef = collection(db, "latesttorrentsmovies")
// const moviesQuery = query(lastmoviesRef, orderBy("LastTimeFound", 'desc'), limit(5));
// export const latesttorrentsmoviesSnapshot = await getDocs(moviesQuery);