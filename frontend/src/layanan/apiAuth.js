import klienApi, { ambilData } from './klienApi.js'

export const login = (kredensial) => klienApi.post('/auth/login', kredensial).then(ambilData)
export const ambilProfil = () => klienApi.get('/auth/profil').then(ambilData)
export const logout = () => klienApi.post('/auth/logout')
