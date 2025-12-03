
const { useState, useEffect } = React

export function BugSort({ onSetFilterBy, filterBy, labels }) {
    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const [sortBy, setSortBy] = useState('')
    const [sortDir, setSortDir] = useState(1)
    const [label, setLabel] = useState('')

    useEffect(() => {
        setFilterByToEdit(filterBy)
        setSortBy(filterBy.sortBy || 'select')
        setSortDir(filterBy.sortDir || 1)
        setLabel(filterBy.label || 'select')
    }, [filterBy])

    function onSort(ev) {

        const newValue = ev.target.value
        setSortBy(newValue)

        if (sortDir === -1) setSortDir(1)

        const updated = { ...filterByToEdit, sortBy: newValue, sortDir }
        setFilterByToEdit(updated)
        onSetFilterBy(updated)
    }

    function onSetLabel(ev) {
        const newLbl = ev.target.value
        setLabel(newLbl)

        if (sortDir === -1) setSortDir(1)

        const updated = { ...filterByToEdit, label: newLbl, sortDir: sortDir }
        setFilterByToEdit(updated)
        onSetFilterBy(updated)
    }

    function onsortDir() {
        const newDir = -sortDir
        setSortDir(newDir)

        const updated = { ...filterByToEdit, sortDir: newDir }
        setFilterByToEdit(updated)
        onSetFilterBy(updated)
    }

    const labelsOptions = labels.map(label =>
        <option key={label} value={label}>{label}</option>
    )

    return (
        <section className="bug-sort">
            <div>
                <label>Sort by</label>
                <select value={sortBy} onChange={onSort}
                    id="bug-options">
                    <option value="select" disabled>Select</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                    <option value="createdAt">Created At</option>
                </select>
            </div>

            <div>
                <label>Label</label>
                <select value={label} onChange={onSetLabel}
                    id="bug-labels">
                    <option value="select" disabled>Select</option>
                    {labelsOptions}
                </select>
            </div>

            <div>
                <button onClick={onsortDir}>↕</button>
            </div>

        </section>
    )
}