//BACK SERVICE
import fs from 'fs'
import { utilService } from './util.service.js'

let gBugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}

const PAGE_SIZE = 3

function query(filterBy = {}) {
    let filtered = [...gBugs]

    const { txt, minSeverity, sortBy, sortDir, label, pageIdx } = filterBy

    if (txt) {
        const regex = new RegExp(txt, 'i')
        filtered = filtered.filter(bug =>
            regex.test(bug.title) || regex.test(bug.description))
    }

    if (minSeverity) {
        filtered = filtered.filter(bug => bug.severity >= +minSeverity)
    }
    if (label) {
        filtered = filtered.filter(bug =>
            bug.labels.some(lbl => lbl === label))
    }

    if (sortBy) {
        if (sortBy === 'title') {
            filtered = filtered.sort((a, b) => a.title.localeCompare(b.title))
        }
        else if (sortBy === 'severity') {
            filtered = filtered.sort((a, b) => a.severity - b.severity)
        }
        else if (sortBy === 'createdAt') {
            filtered = filtered.sort((a, b) => a.createdAt - b.createdAt)
        }

        if (sortDir === -1) filtered.reverse()
    }

    const totalPageSize = Math.ceil(filtered.length / PAGE_SIZE) - 1

    // SS - Pagination~
    if (pageIdx !== null) {
        const startIdx = pageIdx * PAGE_SIZE
        filtered = filtered.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve({ filtered, totalPageSize })
}


function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`No such bug ${bugId}`)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = gBugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject(`No such bug ${bugId}`)
    gBugs.splice(idx, 1)
    return _savebugs()
}

function save(bug) {
    console.log(bug);

    if (bug._id) {
        const idx = gBugs.findIndex((currBug) => currBug._id === bug._id)
        gBugs[idx] = { ...gBugs[idx], ...bug }
    } else {
        bug.createdAt = Date.now()
        bug._id = utilService.makeId()

        gBugs.push(bug)
    }
    return _savebugs().then(() => bug)
}

function _savebugs() {
    return new Promise((resolve, reject) => {
        const strBugs = JSON.stringify(gBugs, null, 2)
        fs.writeFile('data/bug.json', strBugs, (err) => {

            if (err) return reject('Cannot update bugs file')
            else {
                console.log('Wrote Successfully!')
                resolve()
            }
        })
    })
}