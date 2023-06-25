
const rootNode = document.querySelector(':root'),
themeBtn = document.getElementById("nav-bar").querySelector("button");

themeBtn.onclick = changeTheme;

function changeTheme() {
  let rootNodeStyle = getComputedStyle(rootNode);
  if (rootNodeStyle.getPropertyValue("--mainbgcolor") === "#242424") {
    rootNode.style.setProperty("--mainbgcolor", "white");
    rootNode.style.setProperty("--maincolor", "#242424");
  } else {
    rootNode.style.setProperty("--mainbgcolor", "#242424");
    rootNode.style.setProperty("--maincolor", "white");
  }
}