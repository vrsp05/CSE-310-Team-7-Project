export const INTERVIEW_CONTENT = {

    interview_content:

    `============================================================
AI INTERVIEW QUESTION BANK
============================================================

PURPOSE:
This file contains a large, industry-divided interview question bank.
It is designed to be used by an AI interview preparation system.

The AI should NOT ask these questions verbatim every time.
Instead, the AI should dynamically customize questions using:
- Resume data
- Cover letter data
- Job posting data

------------------------------------------------------------
HOW THE AI SHOULD USE THIS FILE
------------------------------------------------------------

1. Identify the user's target industry based on the job posting.
   Examples:
   - Software Engineer → TECH
   - Embedded Engineer → ENGINEERING
   - Nurse → HEALTHCARE
   - HR Generalist → HR / BUSINESS

2. Select relevant question sections for that industry.

3. Personalize questions by injecting:
   - Job title
   - Company name
   - Technologies listed in resume
   - Projects, achievements, or skills mentioned
   - Years of experience

4. Adjust difficulty based on experience level:
   - Entry-level → conceptual & behavioral questions
   - Mid-level → situational & applied questions
   - Senior-level → leadership, strategy, system design

5. Use questions in different modes:
   - Practice mode (with hints and explanations)
   - Mock interview mode (timed, no hints)
   - Behavioral-only
   - Technical-only

------------------------------------------------------------
QUESTION BANK STARTS BELOW
------------------------------------------------------------


==============================
SECTION A: TECH / SOFTWARE DEVELOPMENT
==============================

--- Technical Questions ---

1. Explain the difference between a process and a thread.
2. How does memory management work in your primary programming language?
3. What is the difference between REST and GraphQL?
4. Explain object-oriented programming principles.
5. What are common causes of memory leaks?
6. Describe how garbage collection works.
7. What is a race condition?
8. How do you optimize code performance?
9. Explain time and space complexity.
10. What is dependency injection?
11. Explain MVC architecture.
12. What is the difference between SQL and NoSQL databases?
13. How do you handle exceptions in code?
14. Explain what APIs are and how they work.
15. What is multithreading?
16. Explain the difference between TCP and UDP.
17. How does version control help development teams?
18. What is CI/CD?
19. Explain unit testing versus integration testing.
20. What is containerization?
21. How does authentication differ from authorization?
22. What is OAuth?
23. What design patterns have you used?
24. What is a deadlock?
25. How do you debug a complex system?
26. What is caching and why is it important?
27. Explain microservices architecture.
28. What are environment variables used for?
29. How do you secure an application?
30. What is refactoring?
31. Explain event-driven architecture.
32. What is a load balancer?
33. How does cloud scaling work?
34. What is serverless computing?
35. What is technical debt?
36. How do you maintain backward compatibility?
37. What is a queue?
38. Explain message brokers.
39. What is API versioning?
40. How do you ensure code quality?
41. Explain static typing vs dynamic typing.
42. What is linting?
43. Explain compilation vs interpretation.
44. What is the difference between a framework and a library?
45. How do you manage application configuration?
46. Explain optimistic vs pessimistic locking.
47. What is continuous deployment?
48. How do you monitor production systems?
49. What is observability?
50. What challenges arise when scaling systems?

--- Behavioral & Situational Questions ---

51. Tell me about a difficult bug you fixed.
52. Describe a programming project you are most proud of.
53. How do you handle tight deadlines?
54. Tell me about a disagreement with a teammate.
55. How do you prioritize tasks?
56. Describe a failure and what you learned from it.
57. How do you approach code reviews?
58. Tell me about a time you learned a new technology quickly.
59. How do you handle unclear requirements?
60. Describe a time you improved system performance.
61. How do you explain technical concepts to non-technical people?
62. Tell me about a production issue you handled.
63. How do you handle stress at work?
64. Describe a time you took initiative.
65. How do you respond to feedback?
66. Tell me about a time you helped a teammate.
67. Describe your ideal work environment.
68. How do you stay current with technology?
69. Tell me about a project that did not go as planned.
70. How do you approach problem-solving?
71. Describe a leadership experience.
72. How do you handle ambiguity?
73. Tell me about your experience working remotely.
74. How do you balance speed versus quality?
75. Describe a time you automated a process.
76. How do you handle conflicting priorities?
77. Tell me about mentoring someone.
78. How do you document your work?
79. Describe your experience with legacy code.
80. How do you estimate task effort?
81. How do you avoid burnout?
82. Tell me about a high-pressure situation.
83. How do you handle interruptions?
84. Describe cross-team collaboration.
85. How do you accept criticism?
86. Tell me about a missed deadline.
87. How do you build trust with teammates?
88. Describe a time you simplified a solution.
89. How do you measure success?
90. How do you handle changing requirements?
91. Tell me about a great team experience.
92. Describe how you resolve conflict.
93. How do you learn new skills?
94. Tell me about a risky technical decision.
95. How do you stay organized?
96. Describe adapting to change.
97. How do you handle mistakes?
98. Tell me about a creative solution you developed.
99. How do you take ownership of your work?
100. Why should we hire you?


==============================
SECTION B: ENGINEERING (Electrical, Mechanical, Embedded, Civil)
==============================

101. Explain Ohm’s Law.
102. What is a microcontroller?
103. What is the difference between analog and digital signals?
104. Explain PID control.
105. What is electromagnetic interference (EMI)?
106. Explain the basics of PCB design.
107. What is tolerance in manufacturing?
108. Explain stress versus strain.
109. What is finite element analysis?
110. What is the difference between AC and DC motors?
111. What is signal-to-noise ratio?
112. Explain schematics versus PCB layouts.
113. What is firmware?
114. What is a real-time system?
115. What is an RTOS?
116. How do interrupts work?
117. Explain I2C, SPI, and UART communication.
118. What is grounding and why is it important?
119. How do you manage heat in electronic systems?
120. What is power efficiency?
121. What is a watchdog timer?
122. What is switch debouncing?
123. Explain sensor calibration.
124. What is load analysis?
125. What is fault tolerance?
126. What is redundancy in system design?
127. What manufacturing constraints affect design?
128. What is Design for Manufacturability (DFM)?
129. How do you test engineering systems?
130. What is reliability engineering?
131. What is mechanical advantage?
132. What causes fatigue failure?
133. How do you protect circuits?
134. What is EMC compliance?
135. Explain system integration.
136. What is signal filtering?
137. Explain ADCs and DACs.
138. How do you debug embedded systems?
139. What are timing constraints?
140. How do you perform power budgeting?
141. What safety standards are you familiar with?
142. What is root cause analysis?
143. How do you document engineering work?
144. What is calibration drift?
145. What is tolerance stack-up?
146. What is lifecycle testing?
147. What is environmental testing?
148. What is systems engineering?
149. What is requirements traceability?
150. What is the difference between verification and validation?

151. Describe a complex engineering problem you solved.
152. Tell me about a design failure.
153. How do you test prototypes?
154. Describe working with manufacturing teams.
155. How do you document designs?
156. How do you consider safety in designs?
157. How do you manage design changes?
158. Describe cross-disciplinary collaboration.
159. How do you handle field failures?
160. How do you meet compliance requirements?
161. How do you balance engineering trade-offs?
162. Describe a tight-deadline project.
163. How do you handle unclear specifications?
164. Describe cost-reduction efforts.
165. How do you conduct design reviews?
166. How do you validate requirements?
167. Tell me about a testing challenge.
168. How do you manage technical risk?
169. Describe working with suppliers.
170. How do you ensure quality?
171. Tell me about a system failure.
172. How do you handle pressure?
173. Describe continuous improvement efforts.
174. How do you mentor junior engineers?
175. Tell me about innovation in your work.
176. How do you balance cost and performance?
177. Describe a hands-on build experience.
178. How do you troubleshoot hardware issues?
179. How do you handle documentation challenges?
180. How do you communicate technical details?
181. Describe field testing experience.
182. How do you manage constraints?
183. How do you learn new tools?
184. How do you manage scope creep?
185. Describe a leadership role.
186. How do you ensure safety?
187. How do you handle customer requirements?
188. How do you resolve design conflicts?
189. Describe iterative design.
190. How do you validate assumptions?
191. Describe teamwork experience.
192. How do you stay current in engineering?
193. Describe ethical considerations.
194. How do you conduct failure analysis?
195. Tell me about a redesign project.
196. How do you estimate timelines?
197. Describe a successful product launch.
198. How do you manage documentation?
199. How do you handle change?
200. Why engineering?


==============================
SECTION C: HEALTHCARE
==============================

201. Why did you choose healthcare?
202. How do you protect patient confidentiality?
203. Describe handling a difficult patient.
204. How do you prioritize patient care?
205. Explain HIPAA.
206. How do you manage stress?
207. Describe teamwork in healthcare.
208. How do you respond to emergencies?
209. How do you prevent infections?
210. How do you ensure accuracy?
211. Describe an ethical challenge.
212. How do you communicate with patients?
213. How do you handle medical errors?
214. What are patient safety protocols?
215. How do you manage sensitive information?
216. How do you manage workload?
217. Describe a critical decision.
218. How do you resolve conflict?
219. Why is documentation important?
220. How do you ensure compliance?
221. Describe patient advocacy.
222. How do you stay current in healthcare?
223. Explain interdisciplinary care.
224. How do you prevent burnout?
225. Describe quality improvement.
226. How do you respect cultural differences?
227. Explain informed consent.
228. Describe a challenging case.
229. How do you manage time?
230. Why is teamwork important?
231. How do you handle complaints?
232. Describe safety protocols.
233. How do you show empathy?
234. How do you continue learning?
235. Describe crisis management.
236. How do you handle emotional situations?
237. Explain patient-centered care.
238. Describe compliance challenges.
239. How do you manage risk?
240. What documentation standards do you follow?
241. How do you communicate with families?
242. How do you manage stress?
243. How do you ensure accountability?
244. Describe an ethical dilemma.
245. How do you handle change?
246. Explain patient rights.
247. Describe collaboration.
248. How do you ensure quality care?
249. Explain healthcare regulations.
250. Why should we hire you?


==============================
SECTION D: HR / BUSINESS / OPERATIONS
==============================

251. Describe your HR philosophy.
252. How do you handle workplace conflict?
253. What drives employee engagement?
254. How do you manage performance issues?
255. Describe your recruiting strategy.
256. How do you ensure legal compliance?
257. Explain labor laws.
258. How do you promote diversity and inclusion?
259. Describe onboarding processes.
260. How do you handle terminations?
261. Explain compensation strategy.
262. Describe employee relations.
263. How do you handle grievances?
264. Explain performance evaluations.
265. Describe your leadership style.
266. How do you maintain confidentiality?
267. What HR metrics do you track?
268. Describe training programs.
269. How do you manage organizational change?
270. How do you build culture?
271. Describe conflict resolution.
272. How do you support managers?
273. Explain compliance audits.
274. Describe retention strategies.
275. How do you handle sensitive cases?
276. Explain succession planning.
277. Describe workforce planning.
278. How do you ensure fairness?
279. How do you manage legal risk?
280. Describe negotiation experience.
281. How do you handle feedback?
282. Explain employee wellness initiatives.
283. Describe policy development.
284. How do you manage disputes?
285. How do you protect data privacy?
286. Describe leadership development.
287. How do you measure HR success?
288. Explain organizational change management.
289. Describe crisis handling.
290. How do you manage workload?
291. Explain internal communication.
292. Describe ethical decision-making.
293. How do you prioritize tasks?
294. Explain team dynamics.
295. Describe decision-making.
296. How do you handle pressure?
297. Explain HR technology tools.
298. Describe process improvement.
299. How do you stay current?
300. Why HR?


==============================
SECTION E: GENERAL / CROSS-INDUSTRY
==============================

301. Tell me about yourself.
302. Why are you interested in this role?
303. Why this company?
304. What are your strengths?
305. What are your weaknesses?
306. Where do you see yourself in five years?
307. Describe a failure.
308. Describe a success.
309. What does leadership mean to you?
310. How do you handle stress?
311. Describe teamwork experience.
312. How do you resolve conflict?
313. Describe a challenge you overcame.
314. How do you prioritize work?
315. How do you manage time?
316. How do you learn new skills?
317. Describe adaptability.
318. How do you accept feedback?
319. Describe your communication style.
320. How do you handle pressure?
321. Describe an ethical dilemma.
322. How do you meet deadlines?
323. Describe taking initiative.
324. How do you handle mistakes?
325. Describe collaboration.
326. How do you stay motivated?
327. Describe innovation.
328. How do you manage change?
329. Describe problem-solving.
330. How do you build trust?
331. Describe a leadership challenge.
332. How do you handle ambiguity?
333. Describe a risk you took.
334. How do you manage workload?
335. Describe customer focus.
336. How do you manage priorities?
337. Describe a difficult decision.
338. How do you stay organized?
339. Describe accountability.
340. How do you handle criticism?
341. Describe negotiation.
342. How do you manage expectations?
343. Describe creativity.
344. How do you manage resources?
345. Describe resilience.
346. How do you handle setbacks?
347. Describe mentoring experience.
348. How do you stay productive?
349. Describe team conflict.
350. How do you lead without authority?
351. Describe strategic thinking.
352. How do you define success?
353. Describe adaptability.
354. How do you manage relationships?
355. Describe ethical leadership.
356. How do you manage performance?
357. Describe ownership.
358. How do you handle responsibility?
359. Describe long-term goals.
360. How do you handle change?
361. Describe collaboration.
362. How do you manage communication?
363. Describe decision-making.
364. How do you handle uncertainty?
365. Describe problem resolution.
366. How do you manage stress?
367. Describe continuous improvement.
368. How do you handle failure?
369. Describe initiative.
370. How do you build rapport?
371. Describe innovation.
372. How do you handle pressure?
373. Describe adaptability.
374. How do you manage risk?
375. Describe leadership growth.
376. How do you handle conflict?
377. Describe teamwork success.
378. How do you manage priorities?
379. Describe a learning experience.
380. How do you stay focused?
381. Describe problem-solving success.
382. How do you handle deadlines?
383. Describe motivation.
384. How do you manage expectations?
385. Describe a communication challenge.
386. How do you handle ambiguity?
387. Describe resilience.
388. How do you manage time?
389. Describe accountability.
390. How do you handle mistakes?
391. Describe collaboration success.
392. How do you handle stress?
393. Describe an ethical challenge.
394. How do you manage resources?
395. Describe leadership vision.
396. How do you handle feedback?
397. Describe adaptability.
398. How do you manage conflict?
399. Describe strategic decisions.
400. How do you define success?
401. How do you add value?
402. Describe anticipating problems.
403. How do you manage competing goals?
404. Describe innovation mindset.
405. How do you handle responsibility?
406. Describe team leadership.
407. How do you manage priorities?
408. Describe growth mindset.
409. How do you handle setbacks?
410. Describe collaboration skills.
411. How do you manage expectations?
412. Describe ethical standards.
413. How do you handle complexity?
414. Describe leadership influence.
415. How do you manage change?
416. Describe confident decision-making.
417. How do you handle uncertainty?
418. Describe accountability example.
419. How do you manage performance?
420. Describe problem-solving under pressure.
421. How do you handle feedback?
422. Describe learning from failure.
423. How do you manage relationships?
424. Describe leadership style.
425. How do you handle ambiguity?
426. Describe communication success.
427. How do you meet deadlines?
428. Describe collaboration challenges.
429. How do you handle responsibility?
430. Describe innovation example.
431. How do you manage stress?
432. Describe ethical leadership.
433. How do you manage workload?
434. Describe strategic thinking.
435. How do you handle mistakes?
436. Describe teamwork achievement.
437. How do you manage change?
438. Describe learning agility.
439. How do you handle conflict?
440. Describe resilience example.
441. How do you manage expectations?
442. Describe leadership growth.
443. How do you handle pressure?
444. Describe collaboration success.
445. How do you manage priorities?
446. Describe creative problem-solving.
447. How do you handle ambiguity?
448. Describe accountability.
449. How do you manage time?
450. Describe adaptability.
451. How do you handle failure?
452. Describe leadership challenges.
453. How do you manage communication?
454. Describe innovation.
455. How do you handle uncertainty?
456. Describe ethical judgment.
457. How do you manage resources?
458. Describe team leadership.
459. How do you handle feedback?
460. Describe strategic decision-making.
461. How do you manage stress?
462. Describe learning mindset.
463. How do you handle setbacks?
464. Describe collaboration skills.
465. How do you manage expectations?
466. Describe leadership vision.
467. How do you handle ambiguity?
468. Describe accountability example.
469. How do you manage performance?
470. Describe problem-solving.
471. How do you handle pressure?
472. Describe innovation mindset.
473. How do you manage change?
474. Describe ethical challenges.
475. How do you handle conflict?
476. Describe resilience.
477. How do you manage workload?
478. Describe teamwork success.
479. How do you handle mistakes?
480. Describe leadership influence.
481. How do you manage priorities?
482. Describe learning experience.
483. How do you handle uncertainty?
484. Describe collaboration.
485. How do you manage expectations?
486. Describe ethical leadership.
487. How do you handle stress?
488. Describe adaptability.
489. How do you manage time?
490. Describe accountability.
491. How do you handle failure?
492. Describe strategic thinking.
493. How do you manage resources?
494. Describe leadership growth.
495. How do you handle pressure?
496. Describe innovation example.
497. How do you manage change?
498. Describe team leadership.
499. How do you handle feedback?
500. Why should we hire you?

============================================================
END OF FILE
============================================================
`
};