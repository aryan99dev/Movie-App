import React from 'react'

// Option 1: Import the SVG directly (recommended)
import searchIcon from '/public/search.svg'

const Search = ({searchTerm, setSearchTerm}) => {

  return (
    
    <div className="search">
      <div>
        <img src={searchIcon} alt='search' />

        <input 
        type="text"
        placeholder="Search for a movie or TV show"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}

export default Search