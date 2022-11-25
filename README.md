# 🦃 Turkey Test

### Motivation
My original idea came from the recent progress in language models. I
wanted to see if we could crowdsource turing tests
in a more controlled environment that could also used to evaluate
language models.

If you really stress a system, you may not be fooled,
but I think it's interesting to see how well a system can fool
people in a more natural setting. I think it will also just be fun for
people to actually try it for themselves and see how they do!

In the future, I think it would be cool if there were a platform for ML
researchers to run experiments in the form of games like this.
I guess they probably do that through user/telemetry data already.
Nevertheless, a thought.

### Running locally

**Requirements**
- Python (I'm using version 3.10.8)
- Node/npm/yarn (I'm using Node v16.16.0, npm 9.1.2, yarn 1.22.17)

**Install and Run**
1. Clone the respository
```
git clone https://github.com/alecchendev/turkey-test.git
```
2. Activate your virtual environment (or don't) and install the Python dependencies from `requirements.txt`
```
pip install -r requirements.txt
```
3. Go into `app/` and install Node dependencies
```
cd app
# yarn
yarn
# npm
npm install
```
4. Go into the project's root directory and run the Flask app
```
cd ..
flask --app app --debug run
```