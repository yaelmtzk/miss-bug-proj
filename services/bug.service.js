import fs from 'fs'
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    add,
    update
}

const bugsFile = 'data/bug.json'
const bugs = utilService.readJsonFile(bugsFile)

function query() {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`No such bug ${bugId}`)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject(`No such bug ${bugId}`)
    bugs.splice(idx, 1)
    return _savebugs()
}

function add(bug) {
    const bugToSave = {
        _id: utilService.makeId(),
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        createdAt: Date.now()
    }
    bugs.push(bugToSave)
    return _savebugs().then(() => bugToSave)
}

function update(bug) {
    const bugToUpdate = bugs.find(currbug => currbug._id === bug._id)
    if (!bugToUpdate) return Promise.reject(`No such bug ${bug._id}`)
    bugToUpdate.title = bug.title
    bugToUpdate.description = bug.description
    bugToUpdate.severity = bug.description
    return _savebugs().then(() => bugToUpdate)
}

function _savebugs() {
    return new Promise((resolve, reject) => {
        const strbugs = JSON.stringify(bugs, null, 2)
        fs.writeFile(bugsFile, strbugs, (err) => {
            if (err) return reject('Cannot update bugs file')
            resolve()
        })
    })
}