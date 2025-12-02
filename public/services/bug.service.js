// FRONT SERVICE

const BASE_URL = 'http://127.0.0.1:3030/api/bug/'

export const bugService = {
    query,
    get,
    remove,
    save,
    getEmptyBug,
    getDefaultFilter,
}

function query(filterBy = {}) {
    const params = new URLSearchParams()

    if (filterBy.txt) params.append('txt', filterBy.txt)
    if (filterBy.minSeverity) params.append('minSeverity', filterBy.minSeverity)
    console.log(params);

    return axios.get(BASE_URL + '?' + params.toString())
        .then(res => res.data)
}

function get(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.get(BASE_URL + bugId + '/remove').then(res => res.data)
}

function save(bug) {
    const url = BASE_URL + 'save'
    let queryParams = `?title=${bug.title}&description=${bug.description}&severity=${bug.severity}`

    if (bug._id) queryParams += `&_id=${bug._id}`

    return axios.get(url + queryParams).then(res => res.data)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: '' }
}

function getEmptyBug(title = '', description = '', severity = 0) {
    return { _id: '', title, description, severity, createdAt: Date.now() }
}