// JavaScript source code

function defending() {
    $('#defendingHome').toggleClass('animated pulse');
    $('#defendingAway').toggleClass('animated pulse');
    $('#homePenalty').toggleClass('animated pulse');
    $('#awayPenalty').toggleClass('animated pulse');
    $('#arrow-left').toggleClass('animated slideInRight');
    $('#arrow-leftSmaller').toggleClass('animated slideInRight');
    $('#arrow-leftSmallest').toggleClass('animated slideInRight');
    $('#arrow-leftTwo').toggleClass('animated slideInRight');
    $('#arrow-leftSmallerTwo').toggleClass('animated slideInRight');
    $('#arrow-leftSmallestTwo').toggleClass('animated slideInRight');

}
setInterval(defending, 500);

