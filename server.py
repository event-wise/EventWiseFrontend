from flask import Flask , render_template,current_app, request,redirect,url_for,flash,abort,session,jsonify
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
    app.add_url_rule("/update_user", view_func=update_user, methods=["POST"])
    app.add_url_rule("/groups", view_func=groups_page, methods=["GET"])
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
def update_user():
    return render_template("update_user.html",form=request.form)

def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.data["username"]
        password = form.data["password"]
        headers = {'Content-type': 'application/json'}
        response = requests.post(url="http://eventwise-env.eba-ycrptzz8.eu-central-1.elasticbeanstalk.com/api/account/login"
            ,json={"password": password,
                    "username": username},headers=headers)
        responseJSON = dict(response.json())
        if "ROLE_ADMIN" in responseJSON["roles"]:
            user = User(username,password)
            login_user(user)
            user.is_admin = True
            user.token = responseJSON["token"]
            app.config["user"] = user
            session["user"] = user
            next_page = request.args.get("next", url_for("home_page"))
            return redirect(next_page)

        print("Invalid credentials.")
        flash("Invalid credentials.")
    return render_template("login.html", form=form)

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