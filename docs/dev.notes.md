had a hard time dealing with the api intially so much so i desicded to create an SDK from the OPEN api spec!

faced an issue whist doing a cross domain search where the entity in whos domain we were looking into was too influenced by other entities so we got less relevant results from the main data point entity in that field e.g. when doing a cross domain search in music where we have an artist whitney houston we were not getting results relevant to alike whiteny .. so to fix this we saw teh signal.entities.weight ..increasing this will make the domain entity have more weith...

also discovered that tags are very important, and i can use them to enrich data and get more relevant results


do differnt taste combos eg 
podcast can infer good books
tv shows can infer - podcasts to listen to
movies can infer -> books to read
books can infer -> movies and tv shows to watch!

decided to do pattern matched cross domain profiling instead of using all signals across the board for all domains to yeaild better results

had gone fully agentic workflow with LLM tool calls but decided to go for an agentic workflow implementaiton which allows for more controlled workflow whilst implementaing ai reasoning in key parts also better for context handling 

