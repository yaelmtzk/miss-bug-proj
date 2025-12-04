const { useState, useEffect } = React
const { useParams, useNavigate } = ReactRouterDOM

import { authService } from '../services/auth.service.js'
import { bugService } from '../services/bug.service.js'
import { BugList } from "../cmps/BugList.jsx"
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserDetails() {
    const loggedinUser = authService.getLoggedinUser()
    const [userBugs, setUserBugs] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedinUser) {
            navigate('/')
            return
        }
        loadUserBugs()
    }, [])

    function loadUserBugs() {
        bugService.query({ userId: loggedinUser._id })
            .then(res => {
                console.log(res.filtered);
                
                setUserBugs(res.filtered)
            })
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                setUserBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch(err => {
                console.log('from remove bug', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        if (!severity) return alert('Please enter a severity')
        const bugToSave = { ...bug, severity }
        bugService.save(bugToSave)
            .then(savedBug => {
                console.log('Updated Bug:', savedBug)
                setUserBugs(prevBugs =>
                    prevBugs.map(currBug =>
                        currBug._id === savedBug._id ? savedBug : currBug
                    )
                )
                showSuccessMsg('Bug updated')
            })
            .catch(err => {
                console.log('from edit bug', err)
                showErrorMsg('Cannot update bug')
            })
    }

    if (!loggedinUser) return null

    return (
        <section className="user-profile main-layout">
            <h1>Hello {loggedinUser.fullname}</h1>

            {!userBugs || (!userBugs.length && <h2>No bugs to show</h2>)}
            {userBugs && userBugs.length > 0 && <h3>Manage your bugs</h3>}
            <BugList bugs={userBugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} loggedinUser={loggedinUser} />
        </section>
    )
}