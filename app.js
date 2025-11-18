/* =========================
   CONFIG
========================= */
const TMDB_KEY = "7cc9abef50e4c94689f48516718607be";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const GIFTED = "https://movieapi.giftedtech.co.ke/api/sources/";

/* =====================================================
   HOME PAGE LOGIC (index.html)
===================================================== */
if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {

    async function loadMovies() {
        const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}`);
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
                <img src="${IMG + m.poster_path}">
                <h4>${m.title}</h4>
            `;
            card.onclick = () => {
                window.location.href = `movie.html?id=${m.id}`;
            };
            movieList.appendChild(card);
        });
    }

    // Search
    document.getElementById("searchInput").addEventListener("keyup", async e => {
        const q = e.target.value;
        if (q.length < 1) return loadMovies();

        const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${q}`);
        const data = await res.json();
        displayMovies(data.results);
    });

    loadMovies();
}

/* =====================================================
   MOVIE PAGE LOGIC (movie.html)
===================================================== */
if (window.location.pathname.includes("movie.html")) {

    const url = new URLSearchParams(window.location.search);
    const movieId = url.get("id");

    loadMovieDetails(movieId);
    loadStreaming(movieId);

    async function loadMovieDetails(id) {
        const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}`);
        const m = await res.json();

        document.getElementById("movieTitle").innerText = m.title;

        document.getElementById("movieDetails").innerHTML = `
            <img src="${IMG + m.poster_path}">
            <div>
                <h2>${m.title}</h2>
                <p>${m.overview}</p>
                <p><b>Rating:</b> ${m.vote_average}/10</p>
                <p><b>Release:</b> ${m.release_date}</p>
            </div>
        `;
    }

    async function loadStreaming(id) {
        const res = await fetch(GIFTED + id);
        const data = await res.json();

        const player = document.getElementById("moviePlayer");
        const downloads = document.getElementById("downloadList");

        if (!data.results || data.results.length === 0) {
            player.src = "";
            downloads.innerHTML = "<p>No sources found.</p>";
            return;
        }

        // Stream highest quality
        const best = data.results[data.results.length - 1];
        player.src = best.download_url;

        // Downloads
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