import { useEffect,useState } from 'react'
import Search from './components/Search'
import Spinner from './components/spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';
import heroImage from '../public/hero.png'; // Import the image

const API_BASE_URL = 'https://api.themoviedb.org/3';


const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage,setErrorMessage] = useState('');
    const [trendingMovies, setTrendingMovies] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);


    // Debounce the search term to avoid too many API calls
    // This will wait for 500ms after the user stops typing before updating the search term
useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            
            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                setErrorMessage('No movies found');
                setMovieList([]);
                return;
            }

            setMovieList(data.results);

            if(query && data.results.length > 0) {
                await updateSearchCount(query,data.results[0])
            }

        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies =async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch(error){
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

useEffect(() => {
fetchMovies(debouncedSearchTerm);

}, [debouncedSearchTerm]);

useEffect(() => {
    loadTrendingMovies();
}, []);

    return (
        <main>
            <div className="pattern" />

            <div className="wrapper">
                <header>
                    <img src={heroImage} alt="Hero banner" />
                    <h1>Find<span className="text-gradient"> Movies </span> You'll ENJ<span className="text-gradient">O</span>Y </h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>
                
                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}  </p>
                                    <img src={movie.poster_url} alt={movie.searchTerm} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}


                <section className="all-movies">
                <h2>All movies</h2>

                {isLoading ? (
                    <Spinner />
                ) : errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                ) : (
                    <ul>
                        {movieList.map((movie) => (
                            <MovieCard  key={movie.id} movie={movie} />
                        ))}
                    </ul>
                )}
                </section>
            </div>
        </main>
    )
}
export default App
