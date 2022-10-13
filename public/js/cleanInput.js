export default (input) =>{
    const bannedList = '{}/=?\`\\^%$#|'.split('')
    bannedList.forEach((e)=>{
        input=input.replaceAll(e,"")
    })
    return input
} 


