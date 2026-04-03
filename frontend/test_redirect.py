import urllib.request

def test_login_redirect():
    url = "http://localhost:3001/login"
    try:
        response = urllib.request.urlopen(url)
        print(f"Final URL: {response.geturl()}")
        print(f"Status Code: {response.status}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_redirect()
