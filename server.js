import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// Express Config
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const { txt, minSeverity } = req.query
    console.log(txt, minSeverity);

    bugService.query({ txt, minSeverity })
        .then(bugs => {
            res.json(bugs)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bugs:', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => {
    const bug = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        labels: req.query.labels
    }

    const func = (bug._id) ? 'update' : 'add'
    bugService[func](bug)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot save bug:', err)
            res.status(400).send('Cannot save bug')
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const { visitedBugs = [] } = req.cookies

    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
        else visitedBugs.push(bugId)

        // console.log('visitedBugs', visitedBugs)
        res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 70 })
    }

    bugService.getById(bugId)
        .then(bug => {
            res.json(bug)
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot get bug:', err)
            res.status(400).send('Cannot get bug')
        })
})
app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send('Bug removed')
        })
        .catch(err => {
            loggerService.error('ERROR: Cannot remove bug:', err)
            res.status(400).send('Cannot remove bug')
        })
})

app.listen(3030, () => console.log('Server ready at port 3030')) 