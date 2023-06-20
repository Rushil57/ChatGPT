function AddLoader() {
    $('.overlay').removeClass('d-none');
}

function RemoveLoader() {
    setTimeout(function () { $('.overlay').addClass('d-none'); }, 1000)
}
//function getCookie(name) {
//    const value = `; ${document.cookie}`;
//    const parts = value.split(`; ${name}=`);
//    if (parts.length === 2) return parts.pop().split(';').shift();
//}
//function ClearCockie(name) {
//    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//}