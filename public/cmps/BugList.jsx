import { authService } from '../services/auth.service.js'

const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {

    const user = authService.getLoggedinUser()

    function isAllowed(bug) {
        if (!user) return false
        if (!user.isAdmin && bug.creator._id !== user._id) return false

        return true
    }

    if (!bugs) return <div>Loading...</div>
    return <ul className="bug-list">
        {bugs.map(bug => (
            <li key={bug._id}>
                <BugPreview bug={bug} />
                <section className="actions">
                    <button><Link to={`/bug/${bug._id}`}>Details</Link></button>

                    {isAllowed(bug) && <div>
                        <button onClick={() => onEditBug(bug)}>Edit</button>
                        <button onClick={() => onRemoveBug(bug._id)}>x</button>
                    </div>}
                </section>
            </li>
        ))}
    </ul >
}
