let canvas

const NUMBER_OF_BENCHES = 6
let NUMBER_OF_PEOPLE = 30
let peoplePerGroup = Math.ceil(NUMBER_OF_PEOPLE / (NUMBER_OF_BENCHES * 1.0))
let angleBetween = (2 * Math.PI) / NUMBER_OF_BENCHES

const COLORS = [["#E51A1A", "#F47A21", "#F4EE25", "#20F248", "#2FB6F2", "#8A10FF"],
                ["#EC5858", "#F79E5D", "#F7F360", "#5CF67A", "#67CAF6", "#AA51FF"],
                ["#F07D7D", "#F9B381", "#F9F583", "#80F897", "#89D5F8", "#BC77FF"],
                ["#F49C9C", "#FAC69F", "#FAF8A1", "#9FF9B0", "#A5E0F9", "#CD98FF"],
                ["#F6B1B1", "#FBD2B3", "#FBF9B5", "#B3FBC1", "#B8E6FB", "#D7ADFF"]]
// const COLORS = [["#FFFFFF", "#000000"], ["#000000", "#FFFFFF"]]
let numbers = [...Array(peoplePerGroup)].map(elem => Array(NUMBER_OF_BENCHES));

const BASE_MOVE = 4 * Math.PI
let desiredAngles = new Array(peoplePerGroup)
const MAX_OFFSET = 2 * Math.PI

const MAX_SPEED = 0.4
const TIME_SHIFT = 300
let initialT

const ARC_SPACING = Math.PI/128
const FONT = "bold 2.5em sans-serif"

window.onload = function init() {
  canvas = document.getElementById('spinner')

  for (i = 0; i < desiredAngles.length; i++) {
    desiredAngles[i] = 0
  }

  randomNumbers = new Array(peoplePerGroup * NUMBER_OF_BENCHES)
  for (j = 0; j < randomNumbers.length; j++) {
    randomNumbers[j] = j + 1
  }
  shuffle(randomNumbers)

  for (i = 0; i < numbers.length; i++) {
    for (j = 0; j < numbers[i].length; j++){
      numbers[i][j] = randomNumbers[i * numbers[i].length + j]
    }
  }

  let date = new Date()
  initialT = date.getTime()
  window.requestAnimationFrame(draw)
}

//uses Fischer-Yates algorithm to shuffle
function shuffle(array){
  for (i = array.length - 1; i > 0; i--){
    rand = Math.floor(Math.random() * (i + 1)) //random # between 0 and i inclusive

    temp = array[i]
    array[i] = array[rand]
    array[rand] = temp
  }
}

function reload() {
  //create random offsets for the differnt disks
  for (i = 0; i < desiredAngles.length; i++){
    desiredAngles[i] = desiredAngles[i] % (2 * Math.PI)
    desiredAngles[i] += BASE_MOVE + Math.floor(Math.random() * NUMBER_OF_BENCHES + 1) * angleBetween
  }

  let date = new Date()
  initialT = date.getTime()

  window.requestAnimationFrame(draw)
}

function draw() {
  //set up the canvas/context objects
  const ctx = canvas.getContext('2d');
  canvas.height = 1000
  canvas.width = 1000
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let sliceWidth = (canvas.height / 2.0) / (peoplePerGroup + 2)

  //draw the arcs
  const center = canvas.width/2
  let ringsDone = 0
  let ringsAlmostDone = 0

  for (j = 0; j < peoplePerGroup; j++){

    let radius = sliceWidth * (peoplePerGroup + 1 - j)

    let constantValue = desiredAngles[j]
    let date = new Date()
    let curT = date.getTime()
    let curAngle = constantValue * (1 - Math.pow(Math.E, (-(curT - initialT)/TIME_SHIFT)))

    angleLeft = (desiredAngles[j] - curAngle)
    if (angleLeft < 1e-10) {
      curAngle = desiredAngles[j]
      ringsDone += 1
    }

    if (angleLeft < 1e-1) {
      ringsAlmostDone += 1
    }

    for (i = 0; i < NUMBER_OF_BENCHES; i++) {
      //draw arc
      ctx.fillStyle = COLORS[j % COLORS.length][i % COLORS[0].length]
      ctx.beginPath()
      ctx.moveTo(center, center)

      startAngle = i * angleBetween + curAngle

      //calculate x,y of first point with trig
      const x = center + radius * Math.cos(startAngle)
      const y = center + radius * Math.sin(startAngle)

      ctx.lineTo(x, y)
      ctx.arc(center, center, radius, startAngle, startAngle + angleBetween)
      ctx.fill()

      //draw text
      let number = `${numbers[j][i]}`

      let arcLength = arcTextLength(ctx, radius, FONT, number, ARC_SPACING)
      let startWithinArc = angleBetween / 2 - arcLength / 2
      let textStartAngle = startAngle + startWithinArc

      let arcApproxHeight = approximateHeight(ctx, FONT)
      let arcRadius = radius - sliceWidth/2 - arcApproxHeight

      drawArcText(ctx, textStartAngle, radius - 50, FONT, "#FFFFFF", number, ARC_SPACING)
    }
  }

  //draw cricle in middle
  ctx.fillStyle = "#FFFFFF"
  ctx.beginPath()
  ctx.moveTo(center, center)
  let centerRadius = sliceWidth
  ctx.arc(center, center, centerRadius, 0, 2 * Math.PI)
  ctx.fill()

  //draw spin text
  if (ringsAlmostDone == peoplePerGroup) {
    ctx.fillStyle = "#555555"
  } else {
    ctx.fillStyle = "#999999"
  }
  ctx.font = FONT
  let textSize = ctx.measureText("SPIN")
  let approxHeight = approximateHeight(ctx, FONT)
  ctx.fillText("SPIN", center - textSize.width / 2, center + approxHeight / 2)

  //draw group labels
  for (group = 0; group < NUMBER_OF_BENCHES; group++){
    let textString = `GROUP ${group + 1}`
    let radius = sliceWidth * (peoplePerGroup + 1)  + approxHeight

    let arcLength = arcTextLength(ctx, radius, FONT, textString, ARC_SPACING)
    let startWithinArc = angleBetween / 2 + arcLength / 2
    let startAngle = angleBetween * group - startWithinArc
    drawArcText(ctx, startAngle, radius, FONT, "#555555", textString, ARC_SPACING)

  }

  //request next frame if still needs to rotate
  if (ringsDone != peoplePerGroup) {
    window.requestAnimationFrame(draw)
  }
}

function drawArcText(ctx, startAngle, radius, font, color, string, spacing) {
  let charArray = Array.from(string)
  let curAngle = 0.0
  const center = canvas.width/2

  ctx.fillStyle = color
  ctx.font = font

  for (char = 0; char < charArray.length; char++) {
    let width = ctx.measureText(charArray[char]).width
    let theta = 2 * Math.atan((width / 2) / radius)
    let thisCenterAngle = (startAngle + curAngle + theta / 2)
    ctx.save()

    //translate so center of bottom of text is at 0,0
    let translateX = center + radius * Math.cos(thisCenterAngle)
    let translateY = center + radius * Math.sin(thisCenterAngle)
    ctx.translate(translateX, translateY)
    ctx.rotate(Math.PI/2 + thisCenterAngle)

    ctx.fillText(charArray[char], -(width / 2), 0)
    ctx.restore()

    //console.log(`drawing ${charArray[i]} at ${translateX}, ${translateY}, ${thisCenterAngle}`)
    curAngle += theta + spacing
  }
}

function arcTextLength(ctx, radius, font, string, spacing){
  let charArray = Array.from(string)
  ctx.font = font
  totalAngle = 0

  for (c = 0; c < charArray.length; c++) {
    let width = ctx.measureText(charArray[c]).width
    let theta = 2 * Math.atan((width / 2) / radius)
    totalAngle += theta + spacing
  }

  return totalAngle
}

//gives approx height of text as width of M in that font
function approximateHeight(ctx, font){
  ctx.font = FONT
  return ctx.measureText("M").width
}

function clickHandler(event){
  const boundingBox = canvas.getBoundingClientRect()

  //coords relative to 0 in center of canvas
  const x = event.clientX - boundingBox.left - boundingBox.width / 2
  const y = event.clientY - boundingBox.top - boundingBox.height / 2

  //check whether inside inner circle
  const r = Math.sqrt(x * x + y * y)
  if (r < [(boundingBox.height / 2.0) / (peoplePerGroup + 1)]){
    reload()
  }
}

document.addEventListener("click", clickHandler)
