/* =========================
   YOUR ORIGINAL CONFIG
========================= */

const TMDB_API_KEY = "7cc9abef50e4c94689f48516718607be";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const GIFTED_BASE = "https://movieapi.giftedtech.co.ke/api/sources/";


/* =====================================================
   IF ON HOME PAGE → LOAD MOVIES
===================================================== */

if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {

    async function loadMovies() {
        const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        displayMovies(data.results);
    }

    function displayMovies(movies) {
        const movieList = document.getElementById("movieList");
        movieList.innerHTML = "";

        movies.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.innerHTML = `
                <img src="${IMG_BASE + m.poster_path}">
                <h4>${m.title}</h4>
            `;
            card.onclick = () => {
                window.location.href = `movie.html?id=${m.id}`;
            };
            movieList.appendChild(card);
        });
    }

    document.getElementById("searchInput").addEventListener("keyup", async e => {
        const q = e.target.value;

        if (q.length < 1) return loadMovies();

        const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${q}`);
        const data = await res.json();
        displayMovies(data.results);
    });

    loadMovies();
}


/* =====================================================
   IF ON MOVIE PAGE → LOAD DETAILS + STREAMING
===================================================== */

if (window.location.pathname.includes("movie.html")) {

    const url = new URLSearchParams(window.location.search);
    const movieId = url.get("id");

    loadMovieDetails(movieId);
    loadStreaming(movieId);

    async function loadMovieDetails(id) {
        const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_API_KEY}`);
        const m = await res.json();

        document.getElementById("movieTitle").innerText = m.title;

        document.getElementById("movieDetails").innerHTML = `
            <img src="${IMG_BASE + m.poster_path}">
            <div>
                <h2>${m.title}</h2>
                <p>${m.overview}</p>
                <p><b>Rating:</b> ${m.vote_average}</p>
                <p><b>Release:</b> ${m.release_date}</p>
            </div>
        `;
    }

    async function loadStreaming(id) {
        const res = await fetch(GIFTED_BASE + id);
        const data = await res.json();

        const player = document.getElementById("moviePlayer");
        const downloads = document.getElementById("downloadList");

        if (!data.results || data.results.length === 0) {
            downloads.innerHTML = "<p>No download links found.</p>";
            return;
        }

        // pick best quality
        const best = data.results[data.results.length - 1];
        player.src = best.download_url;

        data.results.forEach(src => {
            const a = document.createElement("a");
            a.href = src.download_url;
            a.innerText = `${src.quality} Download`;
            a.className = "download-link";
            a.download = "";
            downloads.appendChild(a);
        });
    }
}