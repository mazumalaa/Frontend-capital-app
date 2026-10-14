function Jakarta(time) {
     return new Date(time).toLocaleString('id-ID' , {timeZone:'Asia/Jakarta'})
}

export {Jakarta};