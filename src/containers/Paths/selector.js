import { createSelector } from "reselect";
import isEmpty from "lodash/isEmpty";

const getJoinedPaths = state => state.paths.joinedPaths;
const getPublicPaths = state => state.firebase.data.publicPaths;
const getPathStats = state => state.firestore.data.pathStats;

const sortPublicPaths=(inputPaths,pathStats)=>{
  let path,rec;
    let pathStats_new={}
  
    for(path in pathStats){
      for(rec in pathStats[path]['data']){      
        pathStats_new[pathStats[path]['data'][rec]['pathKey']]=pathStats[path]['data'][rec]
      }
    }
   
    for(path in inputPaths){     
      inputPaths[path]={...inputPaths[path],...pathStats_new[path]}
      
    }    
    let sorted = Object.values(inputPaths||{}).sort((a, b) => a.attempts === b.attempts ? 0 : b.attempts < a.attempts ? -1 : 1);
   
    let returnPaths={}
    for(path in sorted){         
        returnPaths[sorted[path].pathKey]=sorted[path]     
    }
       
    return returnPaths
}
export const publicPathSelector = createSelector(
  getPublicPaths,
  getJoinedPaths,
  getPathStats,
  (publicPaths, joinedPaths,pathStats) => {
    let counter = false;   
    publicPaths={...sortPublicPaths(publicPaths,pathStats)}   
    if (joinedPaths && isEmpty(joinedPaths)) {      
      return publicPaths;
    }

    let modifiedPublicPaths = { ...publicPaths };
    Object.keys(joinedPaths || {}).forEach(key => {
      if (publicPaths && publicPaths[key]) {
        modifiedPublicPaths[key].solutions = joinedPaths[key].solutions;
        modifiedPublicPaths[key].totalActivities =
          joinedPaths[key].totalActivities;
        counter = true;
      }
    });
     
 
  
    if (counter) {      
      modifiedPublicPaths={...sortPublicPaths(modifiedPublicPaths,pathStats)}   
      return modifiedPublicPaths;
    }
  }
);
