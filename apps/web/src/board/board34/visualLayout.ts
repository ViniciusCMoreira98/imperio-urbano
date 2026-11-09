import base from'./layout.json';
import{mobileSpaciousStudy,mobileRectangularStudy}from'../mobileStudy';
import{createSpaciousLayout}from'./spaciousLayout';
import{createRectangularLayout}from'./rectangularLayout';
export default mobileRectangularStudy?createRectangularLayout():mobileSpaciousStudy?createSpaciousLayout():base;
