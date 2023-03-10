from flask import Flask , render_template,current_app, request,redirect,url_for,flash,session,jsonify
from flask_login import *
from flask_session import Session
from datetime import timedelta
from is_safe_url import is_safe_url
import views
from forms import LoginForm
import requests
import jwt
from User import User

lm = LoginManager()
@lm.user_loader
def load_user(user_id):
    return session["user"]
     
def create_app():
    app = Flask(__name__)
    app.config.from_object("settings")
    app.add_url_rule("/", view_func=home_page)
    app.config["SESSION_PERMANENT"] = True
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=1)
    Session(app)
    app.add_url_rule("/login", view_func=login_page, methods=["GET", "POST"])
    app.add_url_rule("/logout", view_func=logout_page)
    app.add_url_rule("/authToken", view_func=token_request)
    app.add_url_rule("/users", view_func=users_page, methods=["GET"])
    app.add_url_rule("/groups", view_func=groups_page, methods=["GET"])
    app.add_url_rule("/events", view_func=events_page, methods=["GET"])

    app.add_url_rule("/update_user", view_func=update_user, methods=["POST"])
    app.add_url_rule("/add_user", view_func=add_user, methods=["POST"])

    app.add_url_rule("/update_group", view_func=update_group, methods=["POST"])
    app.add_url_rule("/add_group", view_func=add_group, methods=["POST"])

    app.add_url_rule("/update_event", view_func=update_event, methods=["POST"])
    app.add_url_rule("/add_event", view_func=add_event, methods=["POST"])
    
    lm.init_app(app)
    lm.login_view = "login_page"
    lm.session_protection = None
    return app

def home_page():
    return render_template("home.html")

@login_required
def users_page():
    return render_template("users.html")

@login_required
def groups_page():
    return render_template("groups.html")

@login_required
def events_page():
    return render_template("events.html")

@login_required
def update_user():
    return render_template("update_user.html",form=request.form)

@login_required
def update_group():
    return render_template("update_group.html",form=request.form)

@login_required
def update_event():
    return render_template("update_event.html",form=request.form)

@login_required
def add_user():
    return render_template("add_user.html",keys=["username","displayedName","email","location","role","password","confirmPassword"])

@login_required
def add_group():
    return render_template("add_group.html",keys=["description","groupId","groupName","location"])

@login_required
def add_event():
    return render_template("add_event.html",keys=["dateTime","description","eventId","eventName","groupId","location","type"])

def login_page():
    form = LoginForm()
    errors = []
    if form.validate_on_submit():
        username = form.data["username"]
        password = form.data["password"]
        headers = {'Content-type': 'application/json'}
        response = requests.post(url="http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/account/login"
            ,json={"password": password,
                    "username": username},headers=headers)
        responseJSON = dict(response.json())
        
        try:
            if "ROLE_ADMIN" in responseJSON["roles"]:
                user = User(username,password)
                login_user(user)
                user.is_admin = True
                user.token = responseJSON["token"]
                app.config["user"] = user
                session["user"] = user
                next_page = request.args.get("next", url_for("home_page"))
                return redirect(next_page)
        except:
            print(responseJSON)
            if "message" in responseJSON.keys():
                errors.append(responseJSON["message"])
            else:
                errors.append("Wrong credentials")
            
    return render_template("login.html", form=form,errors=errors)

@login_required
def logout_page():
    logout_user()
    session["user"] = None
    flash("You have logged out.")
    return redirect(url_for("home_page"))

@login_required
def token_request():
    token = session["user"].token
    return jsonify(token)

if __name__ == "__main__":
    app = create_app()
    port=app.config.get("PORT",5000)
    app.run(host="0.0.0.0", port=port)