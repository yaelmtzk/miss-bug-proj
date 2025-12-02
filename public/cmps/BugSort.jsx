const { useState, useEffect } = React

export function BugSort({ onSetFilterBy, filterBy }) {
    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const [sortBy, setSortBy] = useState('select')
    const [sortDir, setSortDir] = useState(1)

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])


    function handleChange(ev) {
        const newValue = ev.target.value
        
        setSortBy(ev.target.value)

        if (sortDir === -1) setSortDir(-sortDir)
            
        setFilterByToEdit(prevFilterBy => 
            ({ ...prevFilterBy, sortBy: newValue, sortDir: sortDir }))

    }

    function onsortDir() {
        setSortDir(-sortDir)
        console.log(sortDir);
        
        setFilterByToEdit(prevFilterBy => 
            ({ ...prevFilterBy, sortDir: sortDir }))
    }

    const { desc } = filterByToEdit
    return (
        <section className="bug-sort">
            <div>
                <label>Sort by:</label>
                <select value={sortBy} onChange={handleChange} 
                id="bug-options" 
                name="favoriteFruit">
                    <option value="select" disabled>Select</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                    <option value="createdAt">Created At</option>
                </select>
            </div>

            <div>
                <button onClick={onsortDir}>↕</button>
            </div>

        </section>
    )
}