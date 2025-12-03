const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [totalPageSize, setTotalPageSize] = useState(null)
    const [labels, setLabels] = useState([])

    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(({ filtered, totalPageSize }) => {
                setBugs(filtered)
                const lbls = getLabels(bugs)
                setLabels(lbls)
                setTotalPageSize(totalPageSize)             
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function getLabels(bugs) {
        if (!bugs) return []
        return [
            ...new Set(bugs.flatMap(bug =>
                Array.isArray(bug.labels) ?
                    bug.labels : []))]
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                setBugs((prevBugs) => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log(`Cannot remove bug`, err);
                showErrorMsg(`Cannot remove bug ${bugId}`, err)
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            description: prompt('Bug description?'),
            severity: +prompt('Bug severity?', 3),
            labels: prompt(`Add one or more labels: \n
                Ex: critical, need-CR, dev-branch`)
                .split(/[\s,]+/).filter(Boolean)
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        console.log(bug);

        const severity = +prompt('New severity?', bug.severity)

        if (severity === '') return

        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onChangePageIdx(diff) {
        setFilterBy((prevFilter) => {
            let newPageIdx = prevFilter.pageIdx + diff
            if (newPageIdx < 0) newPageIdx = totalPageSize
            if (newPageIdx > totalPageSize) newPageIdx = 0
            return { ...prevFilter, pageIdx: newPageIdx }
        })
    }

    return <section className="bug-index main-content">
        <BugFilter
            filterBy={filterBy}
            onSetFilterBy={onSetFilterBy}
            labels={labels} />

        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />

        <div className="paging flex">
            <button
                className="btn"
                onClick={() => {
                    onChangePageIdx(-1)
                }}
            >
                Previous
            </button>
            <span>{filterBy.pageIdx + 1}</span>
            <button
                className="btn"
                onClick={() => {
                    onChangePageIdx(1)
                }}
            >
                Next
            </button>
        </div>
    </section>
}