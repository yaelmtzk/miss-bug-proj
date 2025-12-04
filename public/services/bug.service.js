// FRONT SERVICE

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    get,
    remove,
    save,
    getDefaultFilter,
}

function query(filterBy = {}) {

    return axios.get(BASE_URL, {params: filterBy})
        .then(res => {            
            return res.data
        })
}

function get(bugId) {
    return axios.get(BASE_URL + bugId)
    .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
    .then(res => res.data)
}

function save(bug) {
    const method = bug._id ? 'put' : 'post'
    return axios[method](BASE_URL, bug).then(res => res.data)
}

function getDefaultFilter() {
    return { 
        txt: '', 
        minSeverity: '',
        label: '',
        sortBy: '', 
        sortDir: '',
        label: '',
        userId: '',
        pageIdx: 0 
    }
}